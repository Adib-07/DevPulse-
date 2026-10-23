# DevPulse MCP

A beginner-friendly, local hackathon prototype. It exposes three tools over
stdio using the official MCP Python SDK. All repository and task information is
sample JSON; the server does not connect to GitHub, run commands from tool
inputs, or change files.

## Requirements

Python 3.11 or newer. The project was created with Python 3.14.7 available.

## Set up and run

From this folder, create a private Python environment and install the packages:

```sh
python3 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
```

To run the server directly (it waits quietly for an MCP client):

```sh
./.venv/bin/python server.py
```

Press Ctrl+C to stop it. For interactive testing with the official MCP
Inspector, use:

```sh
./.venv/bin/mcp dev server.py
```

The Inspector needs Node.js and `npx` available. It prints a local web address;
open that address, select **Tools**, and call `get_assigned_tasks`,
`get_repo_alerts`, and `trigger_code_review`. The first two take no inputs. The
last is also a no-input tool and only returns a simulated confirmation.

## Sample data

`tasks.json`, `github.json`, and `alerts.json` are temporary examples for
testing. Member 2 can replace their contents while preserving the documented
field shapes in `data_loader.py`, or provide a compatible `data_loader.py`.
