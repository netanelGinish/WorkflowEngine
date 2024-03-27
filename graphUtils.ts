export class Graph {
    private graph: Map<string, Node>;
    public blocked_steps: Set<[string, string]>;
    public pennding_steps: Set<string>;
    public finnished_steps: Set<string>;
    public failed_steps: Set<string>;

    constructor() {
        this.graph = new Map();
        this.blocked_steps = new Set();
        this.pennding_steps = new Set();
        this.finnished_steps = new Set();
        this.failed_steps = new Set();
    }

    addNode(name: string, independent: boolean = true) {
        if (!this.graph.has(name)) {
            this.graph.set(name, new Node(name));
            if (independent) {
                this.pennding_steps.add(name);
            }
        }
    }

    addEdge(dependant: string, dependancy: string) {
        let dependant_node: Node | undefined;
        let dependancy_node: Node | undefined;

        if (!this.graph.has(dependant)) {
            this.addNode(dependant, false);
        }
        dependant_node = this.graph.get(dependant);
        if (!this.graph.has(dependancy)) {
            this.addNode(dependancy);
        }
        else if (!dependant_node?.canAddDependancy(dependancy)) {
            console.error(`Error adding edge {dependant:${dependant}, dependancy:${dependancy}}, ${dependancy} is dependant on ${dependant}`)
            return;
        }
        dependancy_node = this.graph.get(dependancy);
        if (this.pennding_steps.has(dependant)) {
            this.pennding_steps.delete(dependant)
        }
        dependant_node!.addDependency(dependancy_node!);
        dependancy_node!.addDependant(dependant_node!);
    }

    public getPendingNodes(): Set<string> {
        return this.pennding_steps;
    }

    public markStepAsDone(step_name: string): Node[] {
        if (this.graph.has(step_name) && this.pennding_steps.has(step_name)) {
            this.graph.get(step_name)!.markAsDone();
            this.finnished_steps.add(step_name);
            this.pennding_steps.delete(step_name);
            return this.updateDependantNodesAndGetNextSteps(step_name);
        }
        return [];
    }

    public markStepAsFailed(step_name: string) {
        if (this.graph.has(step_name) && this.pennding_steps.has(step_name)) {
            const effected_node_names: Set<string> = this.graph.get(step_name)!.markAsFailedAndGetEffected();
            effected_node_names.forEach(effected_node_name => { this.blocked_steps.add([effected_node_name, step_name]) })
            this.failed_steps.add(step_name);
            this.pennding_steps.delete(step_name);
        }
    }

    private updateDependantNodesAndGetNextSteps(dependency: string): Node[] {
        const dependency_node: Node | undefined = this.graph.get(dependency)
        if (!dependency_node) {
            console.error("Dependency node not found");
            return [];
        }
        const actionable_steps: Node[] = [];
        for (const dependent of this.graph.get(dependency)!.getDependents()) {
            dependent.removeDependency(dependency_node);
            if (dependent.isUnblocked()) {
                this.pennding_steps.add(dependent.getName());
                actionable_steps.push(dependent);
            }
        }
        return actionable_steps;
    }
}

export class Node {
    private name: string;
    private dependencies: Set<Node>; // Nodes this node is dependant on
    private dependants: Set<Node>; // Nodes dependant on this node
    private status: "N/A" | "Done" | "Failed";

    constructor(name: string) {
        this.name = name;
        this.dependencies = new Set();
        this.dependants = new Set();
        this.status = "N/A";
    }

    public getName(): string {
        return this.name;
    }

    addDependency(dependency: Node) {
        this.dependencies.add(dependency);
    }

    removeDependency(dependency: Node) {
        this.dependencies.delete(dependency);
    }

    addDependant(dependant: Node) {
        this.dependants.add(dependant);
    }

    removeDependant(dependant: Node) {
        this.dependants.delete(dependant);
    }

    getDependencies(): Set<Node> {
        return this.dependencies;
    }

    getDependents(): Set<Node> {
        return this.dependants;
    }

    markAsDone() {
        console.log(`Task ${this.name} is Done !`)
        this.status = "Done";
    }

    isMarkedAsDone(): boolean {
        return this.status == "Done";
    }

    markAsFailedAndGetEffected() {
        console.log(`Task ${this.name} Failed...`)
        this.status = "Failed";
        const effected_nodes: Set<string> = new Set();
        function getEffected(current: Node) {
            if (effected_nodes.has(current.name)) {
                return;
            }
            effected_nodes.add(current.name);
            current.dependants.forEach(dependant => { getEffected(dependant) })
        }
        this.dependants.forEach(dependant => { getEffected(dependant) })
        return effected_nodes;
    }

    isMarkedAsFailed(): boolean {
        return this.status == "Failed";
    }

    isUnblocked(): boolean {
        return this.dependencies.size === 0;
    }

    canAddDependancy(node_name: string): boolean {
        const visited: Set<string> = new Set();
        // Preform a recursive DFS on the dependants in order to make
        // sure this dependancy is not dependant on this node.
        function dfs(current: Node): boolean {
            if (current.name == node_name) {
                return false;
            }
            if (visited.has(current.name) || !current.dependants) {
                return true;
            }
            visited.add(current.name);
            return Array.from(current.dependants).every(dependant => dfs(dependant))
        }
        return dfs(this);
    }
}
