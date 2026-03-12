const pdf = require("pdf-parse")
const fs = require("fs")
const skillsList = require("./jobData")

async function parseResume(filePath){

const dataBuffer = fs.readFileSync(filePath)
const data = await pdf(dataBuffer)

const text = data.text.toLowerCase()

let detectedSkills = []
let missingSkills = []

skillsList.forEach(skill=>{
if(text.includes(skill)){
detectedSkills.push(skill)
}else{
missingSkills.push(skill)
}
})

const score = Math.round((detectedSkills.length/skillsList.length)*100)

let sections = {
education: text.includes("education"),
experience: text.includes("experience"),
projects: text.includes("project"),
skills: text.includes("skills")
}

let suggestions = []

if(!sections.projects){
suggestions.push("Add a projects section")
}

if(detectedSkills.length < 5){
suggestions.push("Add more technical skills")
}

if(!sections.experience){
suggestions.push("Add internship or work experience")
}

return{
score:score,
detected_skills:detectedSkills,
missing_skills:missingSkills.slice(0,5),
sections:sections,
suggestions:suggestions
}

}

module.exports = parseResume