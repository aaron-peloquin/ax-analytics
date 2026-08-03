# AI Fundamentals: Intro to Agent Experience Design (AX)

As we transition from building traditional software integrations to engineering **Agentic AI Systems**, the way we design interfaces must fundamentally change - but I believe the patterns & principals we've developed over the years will stay.

We need to start thinking of our AI Agents as digital team members. Collaborators who communicate entirely through text and possess the unique ability to "say" JSON payloads to take real-world actions in their environment.

For the past 20 years on the web, our core focus as developers has been to craft a great **User Experience (UX)** - designing visual workflows, APIs, and frontends to reduce cognitive friction for human eyes and fingers. Today, we must shift our focus to **Agent Experience (AX)**: building systems that make it effortless for GenAI Agents to reason accurately and successfully complete the tasks we give them.

## What is Agent Experience (AX)?

> [!NOTE]
> **Agent Experience (AX)** is the practice of designing, structuring, and optimizing the interface that we give to a GenAI System (an "Agent"). We want the Agent to navigate this interface with flawless reasoning, minimal context-window overhead, as little ambiguity as we can to reduce confusion.

An AI Agent interacts with our systems through text and JSON schemas rather than monitors and mice. Just as a poorly organized, cluttered user interface confuses a human employee, a cluttered, ambiguously named set of technical tools paralyzes an AI Agent. Good AX ensures that an Agent carries exactly the toolkit it needs to accomplish a specific business outcome.

We optimize user experiences on the web so a new user could be dropped into them, given a vaugly defined task to acomplish, then see if they can successfully navigate - we even literally do this to humans with UX Interviews. We should build our AI's environment to acomplish this goal.

> [!TIP]
> Think of your Agent as a new employee - they're joining the team next week while you're out on vacation. What materials (instructions, onboarding/training docs, and apps) do you provide to them so they can get up and running all on their own?


## Why AX Matters

By treating **Agent Experience** as a core engineering discipline, we ensure that our GenAI systems are:
* **Accurate:** Dramatically reducing tool-selection errors and parameter hallucinations.
* **Predictable:** Enforcing hard constraints so the Agent operates within bounded enterprise guardrails.
* **Cost-Efficient:** Keeping the token payload and context window small, fast, and optimized.
* **Composable:** Building modular capabilities that can be easily shared, mixed, and matched across different internal Agents and automation workflows.

## AX Iteration
Similar to UX iteration, we should not expect to get this all perfect on your first attempt. Focus on getting your project out there, then refine it over time.

## How We Build AX

AX is not abstract; it surfaces tangibly across several key parts of GenAI Applications. We construct the Agent Experience using five core pillars:

| AX Building Block | What It Is | How It Optimizes the Agent's Experience |
| :--- | :--- | :--- |
| **Goal & System Messages** | Core directives defining the Agent's identity, focus, and behavioral boundaries. | Acts as the "onboarding manual," keeping the Agent aligned on the target outcome and business rules. |
| **Memory Management** | Control over which historical messages remain in the active context window. | Filters out conversational noise, preserving context space and preventing the Agent from being distracted by stale data. |
| **[Tools](https://gist.github.com/aaron-peloquin/593eaaa1639be87774c73296a8e91bfc)** | The Agent's Descriptions & Params for it to take actions. Semantic definitions detailing the specific actions available to the Agent, and validation and structural rules embedded directly inside our tool JSON input params. | Acts as the "contextual micro copy" that explicitly tells the Agent *when* and *why* to choose a specific tool, and params serve as the inputs, helping to prevent the Agent from "saying" an invalid payload or hallucinating values. |
| **[Context Documents](https://gist.github.com/aaron-peloquin/27403ce886c89f78fbe35ce009eed205)** | Auxiliary documentation and step-by-step guidance for complex or toolless tasks. | Guides the Agent through complex sequences that aren't self-explanatory, or dictates exact formatting rules (e.g., document styles). |

##  Considerations
- [AX Analytics](https://gist.github.com/aaron-peloquin/721ccf2b09a22c454395194481badbf1): observe agents as if they were humans on a website.