import os
import json
from lupa import LuaRuntime

base_dir = os.path.dirname(os.path.abspath(__file__))

# Initialize Lua runtime
lua = LuaRuntime(unpack_returned_tuples=True)

# Load the Lua file
with open(os.path.join(base_dir, "data.lua"), "r", encoding='utf-8') as file:
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
	with open(os.path.join(base_dir, 'output.json'), 'w', encoding='utf-8') as file:
		# json.dump(dictionary, file, indent=4)
		json.dump(dictionary, file, ensure_ascii=False, indent=None, separators=(',', ':'))

# Read from output.json
def read():
	try:
		with open(os.path.join(base_dir, 'output.json'), 'r', encoding='utf-8') as file:
			return json.load(file)
	except (FileNotFoundError, json.JSONDecodeError) as e:
		print(f'Warning: Could not load JSON - {e}')
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
except OSError as e:
	print(f'Error writing output.json: {e}')
