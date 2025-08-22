local addon = NEAR_DI
addon.accountInfo = {}

local classCount = GetNumClasses()
local numSkillLines = classCount * 3

--- Updates active class skill lines for logged in character
local function UpdateCharClassSkillLineData()
	local sv = NEAR_DI.ASV.char

	sv.activeSkillLines = {} -- clear character's activeSkillLines to add newest data

	local skillType = SKILL_TYPE_CLASS
	for skillLineIndex = 1, numSkillLines do
		local _, _, isActive = GetSkillLineDynamicInfo(skillType, skillLineIndex)

		if isActive then
			local skillLineId = GetSkillLineId(skillType, skillLineIndex)

			sv.activeSkillLines[#sv.activeSkillLines+1] = skillLineId
		end
	end
end

--- Update class names from classId
local function UpdateClassNames()
	local sv = NEAR_DI.ASV.classData

	sv.name = {} -- clear old data

	for i = 1, classCount do
		local classId = GetClassIdByIndex(i)
		local className = GetClassName(0, classId)

		sv.name[classId] = className
	end
end

--- Update classes skill line ids
local function UpdateClassSkillLines()
	local sv = NEAR_DI.ASV.classData

	sv.skillLines = {} -- clear old data

	local skillType = SKILL_TYPE_CLASS
	for skillLineIndex = 1, numSkillLines do
		local skillLineId = GetSkillLineId(skillType, skillLineIndex)
		local skillLineName = GetSkillLineNameById(skillLineId)
		local classId = GetSkillLineClassId(skillType, skillLineIndex)

		sv.skillLines[classId] = sv.skillLines[classId] or {}
		table.insert(sv.skillLines[classId], skillLineId, skillLineName)
	end
end

--- Updates saved class data
function addon.accountInfo.UpdateClassData()
	local sv = NEAR_DI.ASV.classData
	-- only update class data for new API versions
	if sv.updatedAPIVersion ~= GetAPIVersion() then
		UpdateClassNames()
		UpdateClassSkillLines()

		sv.updatedAPIVersion = GetAPIVersion()
	end
end

function addon.accountInfo.Update()
	UpdateCharClassSkillLineData()
end
