import re
from datetime import datetime
import matplotlib.pyplot as plt

# Read and parse the log file
def parse_log_file(file_path):
    log_entries = []
    with open(file_path, 'r') as file:
        for line in file:
            match = re.match(r'\[(.*?)\] (.*)', line)
            if match:
                timestamp_str, event_description = match.groups()
                timestamp = datetime.strptime(
                    timestamp_str, '%Y-%m-%d %H:%M:%S')
                log_entries.append(
                    {'timestamp': timestamp, 'description': event_description})
    return log_entries


# Read log entries from the sample log file
log_file_path = 'Logs/sample.log'
log_entries = parse_log_file(log_file_path)

# Sort log entries by timestamp
sorted_log_entries = sorted(log_entries, key=lambda x: x['timestamp'])

# Extract timestamps and event descriptions for plotting
timestamps = [entry['timestamp'] for entry in sorted_log_entries]
descriptions = [entry['description'] for entry in sorted_log_entries]

# Create a timeline chart using Matplotlib
plt.figure(figsize=(10, 6))
plt.plot(timestamps, range(len(timestamps)), marker='o')
plt.yticks(range(len(timestamps)), descriptions)
plt.xlabel('Timestamp')
plt.ylabel('Event Description')
plt.title('Log Timeline')
plt.grid(True)
plt.tight_layout()

# Rotate x-axis labels for better visibility
plt.xticks(rotation=45, ha='right')

# Display the timeline chart
plt.show()