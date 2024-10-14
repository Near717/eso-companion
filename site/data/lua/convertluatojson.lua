local cjson = require("cjson")

local dataFile = assert(loadfile("../data.lua"))

dataFile()

--[[ -- Load the configuration from config.lua
local config = require("config")

-- Create a new Lua table to hold the filtered data
local filteredData = {}

-- Loop through the original Lua table and extract only the necessary parts
for server, serverData in pairs(NearDailyInfo_Data) do
    if server == config.server then
        for userId, userData in pairs(serverData) do
            if userId == config.userId then
                filteredData = {
                    data = {
                        char = userData["$AccountWide"].char,
                        account = userData["$AccountWide"].account
                    }
                }
                break
            end
        end
        break
    end
end

-- Convert the filtered Lua table to JSON string
local jsonString = cjson.encode(filteredData) ]]

-- Convert the Lua table to JSON string
local jsonString = cjson.encode(NearDailyInfo_Data)

-- Open a file in write mode
local file = io.open("../output.json", "w")

-- Write the JSON string to the file
file:write(jsonString)

-- Close the file
file:close()

print("JSON data has been written to output.json")
