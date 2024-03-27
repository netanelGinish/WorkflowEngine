import { Graph } from './graphUtils';
import { ActionExecutor, ActionType } from './actionExecutor'

export class Workflow {
    public name: string;
    public steps: Map<string, WorkflowStep>;
    private workflow_graph: Graph;

    constructor(name: string, steps: Map<string, WorkflowStep>) {
        this.name = name;
        this.steps = steps;
        this.workflow_graph = this._process_graph(steps);
    }

    private _process_graph(steps: Map<string, WorkflowStep>) {
        const graph: Graph = new Graph();

        steps.forEach((step, name) => {
            if (step.dependencies) {
                step.dependencies.forEach(dependency => {
                    graph.addEdge(name, dependency)
                })
            }
            else {
                graph.addNode(name);
            }
        });
        return graph
    }

    public async execute_workflow() {
        let pending_nodes = this.workflow_graph.getPendingNodes();

        const promises = Array.from(pending_nodes).map(async (step_name) => {
            const step = this.steps.get(step_name);
            if (!step) {
                console.error(`Step with name '${step_name}' not found.`);
                return; // Skip if step not found
            }

            try {
                this.execute_step_chain(step_name, step)
            } catch (error) {
                console.error(`Error executing step '${step_name}':`, error);
                return; // Stop workflow on failure
            }
        });

        await Promise.all(promises); // Wait for all pending steps to resolve

        while (this.workflow_graph.pennding_steps.size != 0) {
            await new Promise(resolve => {
                return setTimeout(resolve, 500);
            });
        }
        console.log("\n\n\n\nWorkflow completed!");
        console.log("Finnished seccessfully: ")
        this.workflow_graph.finnished_steps.forEach(step => { console.log(step) })
        if (this.workflow_graph.failed_steps) {
            console.log("Failed: ")
            this.workflow_graph.failed_steps.forEach(step => { console.log(step) })
            console.log("blocked by failed steps: ")
            this.workflow_graph.blocked_steps.forEach(tuple => {
                const [blocked_step_name, failed_step_name] = tuple;
                console.log(`${blocked_step_name} blocked by failing ${failed_step_name}`);
            })
        }
    }

    private async execute_step_chain(step_name: string, step: WorkflowStep) {
        try {
            const result = await step.execute();
            if (result === 'SUCCESS') {
                const next_steps_names = this.workflow_graph.markStepAsDone(step_name);
                const promises = next_steps_names.map(async (next_step_name) => {
                    const next_step = this.steps.get(next_step_name.getName());
                    this.execute_step_chain(next_step_name.getName(), next_step!);
                }
                );
                await Promise.all(promises);
            } else {
                this.workflow_graph.markStepAsFailed(step_name)
                // Handle failure. For now let's log and stop the workflow
                console.error(`Step '${step_name}' failed to execute.`);
                return; // Stop workflow on failure
            }
        } catch (error) {
            console.error(`Error executing step '${step_name}':`, error);
            return; // Stop workflow on failure
        }
    }
}

export class WorkflowStep {
    public action_type: ActionType;
    public action_payload: any;
    public dependencies?: string[]; // Names of steps this step is dependant on
    private action_executor_instance: ActionExecutor // Singleton

    constructor(action_type: ActionType, action_payload: any, dependencies?: string[]) {
        this.action_type = action_type;
        this.action_payload = action_payload;
        this.dependencies = dependencies;
        this.action_executor_instance = ActionExecutor.getInstance();
    }

    async execute() {
        const step_result = await this.action_executor_instance.executeAction(this.action_type, this.action_payload);
        return step_result.status;
    }
}