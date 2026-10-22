
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent


def read_json_file(filename):
    file_path = DATA_DIR / filename

    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_tasks():
    data = read_json_file("tasks.json")
    return data["tasks"]


def get_pull_requests():
    data = read_json_file("github.json")
    return data["pull_requests"]


def get_system_alerts():
    data = read_json_file("alerts.json")
    return data["active_alerts"]


if __name__ == "__main__":
    print("\n=== BUG TICKETS ===")
    for task in get_tasks():
        print(task["id"], "-", task["title"], "|", task["status"])

    print("\n=== GITHUB PULL REQUESTS ===")
    for pr in get_pull_requests():
        print("PR", pr["id"], "-", pr["title"])
        print("Tests:", pr["checks"]["tests"])

    print("\n=== SYSTEM ALERTS ===")
    for alert in get_system_alerts():
        print(alert["severity"], "-", alert["message"])
