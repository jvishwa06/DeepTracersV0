import subprocess
import os

scripts = [
    "Backend/DeepfakeBackend.py",
    "Backend/DatabaseBackend.py",
    "Backend/ChatbotBackend.py"
]

if os.name == 'nt':  # For Windows
    terminal_command = "start cmd /K python"
else:  # For Linux/macOS
    terminal_command = "gnome-terminal -- bash -c 'python {} ; exec bash'"

for script in scripts:
    if os.name == 'nt':
        subprocess.run(f"{terminal_command} {script}", shell=True)
    else:
        subprocess.Popen(terminal_command.format(script), shell=True)
