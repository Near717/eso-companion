import json
from lupa import LuaRuntime

# Initialize Lua runtime
lua = LuaRuntime(unpack_returned_tuples=True)

# Load the Lua file
with open("../data.lua", "r") as file:
	lua_code = file.read()

# Execute the Lua code
lua.execute(lua_code)

# Access the Lua table
NearDailyInfo_Data = lua.globals().NearDailyInfo_Data

# Convert the Lua table to a Python dictionary
# def lua_table_to_dict(lua_table):
# 	# Check if the item is a Lua table by checking its type name
# 	if type(lua_table).__name__ == '_LuaTable':
# 		return {key: lua_table_to_dict(value) for key, value in lua_table.items()}
# 	else:
# 		return lua_table

def lua_table_to_dict(lua_table):
    if type(lua_table).__name__ == '_LuaTable':
        # Check if keys are integers, then treat as list
        if all(isinstance(key, int) for key in lua_table.keys()):
            return [lua_table_to_dict(lua_table[key]) for key in sorted(lua_table.keys())]
        else:
            return {key: lua_table_to_dict(value) for key, value in lua_table.items()}
    else:
        return lua_table

# Convert the entire table to a Python dictionary
python_data = lua_table_to_dict(NearDailyInfo_Data)

# Write to output.json
def write(dictionary):
	with open('../output.json', 'w') as file:
		# json.dump(dictionary, file, indent=4)
		json.dump(dictionary, file, indent=None, separators=(',', ':'))

# Read from output.json
def read():
	try:
		with open('../output.json', 'r') as file:
			return json.load(file)
	except FileNotFoundError:
		return {}

# Main
# Read JSON data
dictionary = read()

# Merge Lua data into JSON data
dictionary.update(python_data)

# Write updated data to JSON
try:
	write(dictionary)
	print('JSON data has been written to output.json')
except:
	print('Something went wrong when writing')
