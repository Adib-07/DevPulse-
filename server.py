"""DevPulse MCP: a local, mock-data-only MCP server."""

from mcp.server import MCPServer

from data_loader import get_pull_requests, get_system_alerts, get_tasks


mcp = MCPServer("DevPulse MCP")


@mcp.tool()
def get_assigned_tasks() -> str:
    """Show Mahi's mock developer task data."""
    try:
        tasks = get_tasks()
        if not isinstance(tasks, list):
            raise ValueError("tasks.json must contain a tasks list.")
        if not tasks:
            return "No assigned tasks were found."

        lines = ["Assigned tasks:"]
        for task in tasks:
            if not isinstance(task, dict):
                raise ValueError("Each task must be a JSON object.")
            required_fields = ("id", "title", "status", "priority", "assignee")
            if any(not isinstance(task.get(field), str) for field in required_fields):
                raise ValueError(
                    "Each task must include text fields: id, title, status, priority, and assignee."
                )
            lines.append(
                f"- {task['id']}: {task['title']} "
                f"(status: {task['status']}; priority: {task['priority']}; "
                f"assignee: {task['assignee']})"
            )
            description = task.get("description")
            if isinstance(description, str) and description:
                lines.append(f"  {description}")
        return "\n".join(lines)
    except (OSError, ValueError, KeyError) as exc:
        return f"Could not read task data: {exc}"


@mcp.tool()
def get_repo_alerts() -> str:
    """Show Mahi's mock pull requests, CI checks, and monitoring alerts."""
    try:
        pull_requests = get_pull_requests()
        alerts = get_system_alerts()
        if not isinstance(pull_requests, list):
            raise ValueError("github.json must contain a pull_requests list.")
        if not isinstance(alerts, list):
            raise ValueError("alerts.json must contain an active_alerts list.")

        lines = ["Repository status:"]
        open_pull_requests = []
        for pull_request in pull_requests:
            if not isinstance(pull_request, dict):
                raise ValueError("Each pull request must be a JSON object.")
            status = pull_request.get("status", "Unknown")
            if not isinstance(status, str):
                raise ValueError("Each pull request status must be text.")
            if status.casefold() == "open":
                open_pull_requests.append(pull_request)

        if open_pull_requests:
            lines.append("Open pull requests:")
            for pull_request in open_pull_requests:
                checks = pull_request.get("checks", {})
                if not isinstance(checks, dict):
                    raise ValueError("Pull request checks must be a JSON object.")
                lines.append(
                    f"- PR {pull_request.get('id', 'unknown')}: "
                    f"{pull_request.get('title', 'Untitled')} "
                    f"(author: {pull_request.get('author', 'unknown')}; "
                    f"review: {pull_request.get('review_status', 'Unknown')})"
                )
                lines.append(
                    f"  Tests: {checks.get('tests', 'Not reported')}; "
                    f"build: {checks.get('build', 'Not reported')}"
                )
                failure_reason = pull_request.get("failure_reason")
                if isinstance(failure_reason, str) and failure_reason:
                    lines.append(f"  Check detail: {failure_reason}")
        else:
            lines.append("Open pull requests: none")

        lines.append("Alerts:")
        if alerts:
            for alert in alerts:
                if not isinstance(alert, dict):
                    raise ValueError("Each active alert must be a JSON object.")
                severity = alert.get("severity", "Unknown")
                message = alert.get("message", "No alert message provided")
                if not isinstance(severity, str) or not isinstance(message, str):
                    raise ValueError("Alert severity and message must be text.")
                lines.append(f"- {severity}: {message}")
        else:
            lines.append("- None")
        return "\n".join(lines)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        return f"Could not read repository or alert data: {exc}"


@mcp.tool()
def trigger_code_review() -> str:
    """Safely simulate queuing a code review; no repository is contacted."""
    return (
        "Simulated code review queued successfully. "
        "No GitHub repository was contacted or changed."
    )


if __name__ == "__main__":
    # stdio is the SDK's default transport. Do not print to stdout here:
    # MCP uses it to communicate with the client.
    mcp.run()
