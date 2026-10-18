from bson import ObjectId
from bson.errors import InvalidId
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

STAGES = ["Applied", "Screening", "Shortlisted", "Interview", "Selected", "Rejected"]
ALIASES = {s.lower(): s for s in STAGES}
ALIASES.update({"new": "Applied", "hired": "Selected"})


def _oid(value):
    if isinstance(value, ObjectId):
        return value
    try:
        return ObjectId(str(value))
    except (InvalidId, TypeError):
        return None


def register_candidate_status_routes(app, candidates_collection, jobs_collection):
    @jwt_required()
    def set_candidate_stage(candidate_id):
        data = request.get_json(silent=True) or {}
        stage = ALIASES.get(str(data.get("status", "")).strip().lower())
        if not stage:
            return jsonify({"error": "Invalid status", "allowed_statuses": STAGES}), 400

        cid = _oid(candidate_id)
        if cid is None:
            return jsonify({"error": "Invalid candidate id"}), 400

        candidate = candidates_collection.find_one({"_id": cid})
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        recruiter_id = get_jwt_identity()
        allowed = str(candidate.get("recruiter_id")) == recruiter_id
        if not allowed:
            job_id = _oid(candidate.get("job_id"))
            if job_id is not None:
                allowed = jobs_collection.find_one({"_id": job_id, "recruiter_id": recruiter_id}) is not None
        if not allowed:
            return jsonify({"error": "You can only update candidates on your own jobs"}), 403

        candidates_collection.update_one({"_id": cid}, {"$set": {"status": stage}})
        return jsonify({"message": "Candidate status updated successfully", "status": stage}), 200

    app.add_url_rule(
        "/candidates/<candidate_id>/status",
        endpoint="set_candidate_stage_route",
        view_func=set_candidate_stage,
        methods=["PUT"],
    )
