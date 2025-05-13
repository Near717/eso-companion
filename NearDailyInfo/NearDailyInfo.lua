local addon = NEAR_DI
-------------------------------------------------------------------------------------------------------------------------------------------------------------------

local defaults = {
	full = {
		account = {
			dailyReward = {},
			endeavor = {
				daily = {},
				weekly = {},
			},
			charInfo = {},
		},
		char = {}
	},
	lite = {
		account = {
			dailyReward = {},
		},
	}
}

local function updateLastUpdated(sv)
	sv.lastUpdated = os.time()
end

local function updateDailyLoginRewards(claimed)
	local sv = NEAR_DI.ASV.account.dailyReward
	sv.claimed = claimed

	updateLastUpdated(sv)
end

local function updateTimedActivityData()
	local sv = NEAR_DI.ASV.account

	for k in pairs(sv.endeavor.daily) do
		sv.endeavor.daily[k] = nil
	end

	for k in pairs(sv.endeavor.weekly) do
		sv.endeavor.weekly[k] = nil
	end

	for index = 1, 8 do
		local activityType = GetTimedActivityType(index)
		local activityName = GetTimedActivityName(index)
		local progress = GetTimedActivityProgress(index)
		local maxProgress = GetTimedActivityMaxProgress(index)

		local complete = false
		if progress == maxProgress then complete = true end

		local loop = 5
		local svtype = "daily"
		if activityType == TIMED_ACTIVITY_TYPE_WEEKLY then
			loop = 3
			svtype = "weekly"
		end

		for i = 1, loop do
			if sv.endeavor[svtype][i] == nil then
				sv.endeavor[svtype][i] = {
					name = activityName,
					progress = progress,
					maxProgress = maxProgress,
					complete = complete
				}
				break
			end
		end
	end

	updateLastUpdated(sv)
end

local function updateRidingData()
	local sv = NEAR_DI.ASV.char

	if STABLE_MANAGER:IsRidingSkillMaxedOut() then
		sv.riding = '-'
	else
		local timeMs = GetTimeUntilCanBeTrained()
		if timeMs == 0 then
			sv.riding = 'not done'
		else
			sv.riding = 'done'
		end
	end

	updateLastUpdated(sv)
end

local function updateCharList()
	local sv = NEAR_DI.ASV.account
	for i = 1, GetNumCharacters() do
		local name, _, _, _, _, _, id, _ = GetCharacterInfo(i)
		sv.charInfo[i] = { charId = id, charName = zo_strformat("<<1>>", name), }
	end
end

local function Init()
	EVENT_MANAGER:UnregisterForEvent(addon.name, EVENT_PLAYER_ACTIVATED)
	updateTimedActivityData()
	updateRidingData()
	updateCharList()
end

local function InitRewards()
	EVENT_MANAGER:UnregisterForEvent(addon.name .. '_rewards', EVENT_PLAYER_ACTIVATED)
	if not IsDailyLoginRewardInCurrentMonthClaimed(GetDailyLoginClaimableRewardIndex()) then
		updateDailyLoginRewards(false)
	else
		updateDailyLoginRewards(true)
	end
end

-------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Events
-------------------------------------------------------------------------------------------------------------------------------------------------------------------

local function OnRewardAvailable()
	updateDailyLoginRewards(false)
end

local function OnRewardClaimed()
	updateDailyLoginRewards(true)
end

local function OnRidingSkillImprovement(_, ridingSkillType, previous, current, source)
	updateRidingData()
end

local function OnEndeavorProgressUpdated(_, index, previousProgress, currentProgress, complete)
	local sv = NEAR_DI.ASV.account

	local activityType = GetTimedActivityType(index)
	local activityName = GetTimedActivityName(index)
	local maxProgress = GetTimedActivityMaxProgress(index)

	local loop = 5
	local svtype = "daily"
	if activityType == TIMED_ACTIVITY_TYPE_WEEKLY then
		loop = 3
		svtype = "weekly"
	end

	for i = 1, loop do
		if sv.endeavor[svtype][i].name == activityName then
			sv.endeavor[svtype][i] = {
				name = activityName,
				progress = currentProgress,
				maxProgress = maxProgress,
				complete = complete
			}
			break
		end
	end

	updateLastUpdated(sv)
end

local function OnTimedActivityReset()
	zo_callLater(updateTimedActivityData, 1000)
	zo_callLater(updateRidingData, 1000)
end

-------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Time played
-------------------------------------------------------------------------------------------------------------------------------------------------------------------

local function OnLogOut()
	local sv = NEAR_DI.ASV.char
	sv.played = GetSecondsPlayed()
	updateLastUpdated(sv)
end

-------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Addon loading
-------------------------------------------------------------------------------------------------------------------------------------------------------------------
local function OnAddonLoaded(event, name)
	if name ~= addon.name then return end
	EVENT_MANAGER:UnregisterForEvent(addon.name, EVENT_ADD_ON_LOADED)

	addon.ASV = {}
	if GetDisplayName() == addon.config.mainDisplayName then
		addon.ASV.account = ZO_SavedVars:NewAccountWide(addon.name .. "_Data", 1, "account", defaults.full.account, GetWorldName())
		addon.ASV.char = ZO_SavedVars:NewAccountWide(addon.name .. "_Data", 1, "char", defaults.full.char, GetWorldName())

		addon.ASV.char[GetCurrentCharacterId()] = addon.ASV.char[GetCurrentCharacterId()] or {}
		addon.ASV.chars = addon.ASV.char
		addon.ASV.char = addon.ASV.char[GetCurrentCharacterId()]

		EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_PLAYER_ACTIVATED, Init)
		EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_RIDING_SKILL_IMPROVEMENT, OnRidingSkillImprovement)
		EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_TIMED_ACTIVITY_SYSTEM_STATUS_UPDATED, OnTimedActivityReset)
		EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_TIMED_ACTIVITY_PROGRESS_UPDATED, OnEndeavorProgressUpdated)
		-- EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_TIMED_ACTIVITIES_UPDATED, RefreshAll)
		ZO_PreHook('Logout', OnLogOut)
		ZO_PreHook('Quit', OnLogOut)
	else
		addon.ASV.account = ZO_SavedVars:NewAccountWide(addon.name .. "_Data", 1, "account", defaults.lite.account, GetWorldName())
	end

	EVENT_MANAGER:RegisterForEvent(addon.name .. '_rewards', EVENT_PLAYER_ACTIVATED, InitRewards)
	EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_NEW_DAILY_LOGIN_REWARD_AVAILABLE, OnRewardAvailable)
	EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_DAILY_LOGIN_REWARDS_CLAIMED, OnRewardClaimed)

end

EVENT_MANAGER:RegisterForEvent(addon.name, EVENT_ADD_ON_LOADED, OnAddonLoaded)
