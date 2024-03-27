// Action types
export enum ActionType {
    SEND_EMAIL = 'SEND_EMAIL',
    UPDATE_GRANT = 'UPDATE_GRANT',
    WAIT = 'WAIT'
}

// Action status
type ActionStatus = 'SUCCESS' | 'FAILURE';

// Action with status
interface Action<T = any> {
    type: ActionType;
    payload?: T;
    status?: ActionStatus;
}

// Generic Action Executor
export class ActionExecutor {
    private static instance: ActionExecutor;
    private actions: Map<ActionType, (payload: any) => Promise<ActionStatus>> = new Map();

    private constructor() { }

    public static getInstance(): ActionExecutor {
        if (!ActionExecutor.instance) {
            ActionExecutor.instance = new ActionExecutor();
        }
        return ActionExecutor.instance;
    }


    registerAction<T>(type: ActionType, handler: (payload: T) => Promise<ActionStatus>) {
        this.actions.set(type, handler);
    }

    async executeAction<T>(type: ActionType, payload: T): Promise<Action<T>> {
        const handler = this.actions.get(type);
        if (handler) {
            const status = await handler(payload);
            return { type, payload, status };
        } else {
            console.error(`Action type '${type}' not found.`);
            return { type, payload, status: 'FAILURE' };
        }
    }
}

// Action payloads
export interface SendEmailPayload {
    to: string;
    subject: string;
    body: string;
    testing_fail?: boolean;
}

export interface UpdateGrantPayload {
    grantId: string;
    status: "pending" | "approved" | "rejected";
    testing_fail?: boolean;
}

export interface waitPayload {
    wait_time_seconds: number;
    testing_fail?: boolean;
}


// Register Actions

const actionExecutor = ActionExecutor.getInstance();

actionExecutor.registerAction(ActionType.SEND_EMAIL, async (payload: SendEmailPayload) => {
    if (payload.testing_fail == true) {
        console.error(`email with subject ${payload.subject} fail dou to debugging`);
        return "FAILURE"
    }
    console.log(`EMAIL SENT: \n ${payload.subject}\nDear ${payload.to}, ${payload.body}, Thanks`)
    return 'SUCCESS';
});

actionExecutor.registerAction(ActionType.UPDATE_GRANT, async (payload: UpdateGrantPayload) => {
    if (payload.testing_fail == true) {
        console.error(`update grant ${payload.grantId} fail dou to debugging`);
        return "FAILURE"
    }
    console.log(`Grant id: ${payload.grantId} assgined new status: ${payload.status}`)
    return 'SUCCESS'; // For this example, let's assume it always succeeds
});

actionExecutor.registerAction(ActionType.WAIT, async (payload: waitPayload) => {
    if (payload.testing_fail == true) {
        console.error(`wait failed dou to debugging`);
        return "FAILURE"
    }

    console.log(`Wait: ${payload.wait_time_seconds} seconds`)
    await new Promise(resolve => {
        return setTimeout(resolve, payload.wait_time_seconds * 1000);
    });
    console.log(`Done Wait: ${payload.wait_time_seconds} seconds`)
    return 'SUCCESS'
});




