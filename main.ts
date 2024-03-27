import { ActionType } from './actionExecutor'
import { Workflow, WorkflowStep } from './workflowEngine'

const validWorkflowSteps = new Map<string, WorkflowStep>();

// Step 1: Wait for 5 seconds 
validWorkflowSteps.set('wait', new WorkflowStep(
    ActionType.WAIT,
    { wait_time_seconds: 5 },
));
// Step 2: Update 3 grants (the second depends on successful wait)
validWorkflowSteps.set('updateGrant1', new WorkflowStep(
    ActionType.UPDATE_GRANT,
    { grantId: 'updateGrant1', status: 'approved'},
));
validWorkflowSteps.set('updateGrant2', new WorkflowStep(
    ActionType.UPDATE_GRANT,
    { grantId: 'updateGrant2', status: 'approved' },
    ['wait'] // This step depends on the 'sendEmail' step being successful
));
validWorkflowSteps.set('updateGrant3', new WorkflowStep(
    ActionType.UPDATE_GRANT,
    { grantId: 'updateGrant3', status: 'approved' },
));

// Step 3: Update 3 grants (depends on first grant)
validWorkflowSteps.set('sendEmail1', new WorkflowStep(
    ActionType.SEND_EMAIL,
    { to: 'recipient@example.com', subject: 'First Email', body: 'The workflow is Done.' },
    ['updateGrant1']
));

// Step 4: Update 3 grants (depends on successful all grants)
validWorkflowSteps.set('sendEmail2', new WorkflowStep(
    ActionType.SEND_EMAIL,
    { to: 'recipient@example.com', subject: 'Workflow Notification', body: 'The workflow is Done.' },
    ['updateGrant1', 'updateGrant2', 'updateGrant3',]
));


// Create the workflow object
const exampleValidWorkflow = new Workflow('Example Valid Workflow', validWorkflowSteps);

exampleValidWorkflow.execute_workflow()

//////////// Example workflow with failing step ////////////////

// const invalidWorkflowSteps = new Map<string, WorkflowStep>();

// // Step 1: Wait for 5 seconds 
// invalidWorkflowSteps.set('wait', new WorkflowStep(
//     ActionType.WAIT,
//     { wait_time_seconds: 5 },
// ));
// // Step 2: Update 3 grants (the second depends on successful wait)
// invalidWorkflowSteps.set('updateGrant1', new WorkflowStep(
//     ActionType.UPDATE_GRANT,
//     { grantId: 'updateGrant1', status: 'approved', testing_fail: true },
// ));
// invalidWorkflowSteps.set('updateGrant2', new WorkflowStep(
//     ActionType.UPDATE_GRANT,
//     { grantId: 'updateGrant2', status: 'approved' },
//     ['wait'] // This step depends on the 'sendEmail' step being successful
// ));
// invalidWorkflowSteps.set('updateGrant3', new WorkflowStep(
//     ActionType.UPDATE_GRANT,
//     { grantId: 'updateGrant3', status: 'approved' },
// ));

// // Step 3: Update 3 grants (depends on first grant)
// invalidWorkflowSteps.set('sendEmail1', new WorkflowStep(
//     ActionType.SEND_EMAIL,
//     { to: 'recipient@example.com', subject: 'First Email', body: 'The workflow is Done.' },
//     ['updateGrant1']
// ));

// // Step 4: Update 3 grants (depends on successful all grants)
// invalidWorkflowSteps.set('sendEmail2', new WorkflowStep(
//     ActionType.SEND_EMAIL,
//     { to: 'recipient@example.com', subject: 'Workflow Notification', body: 'The workflow is Done.' },
//     ['updateGrant1', 'updateGrant2', 'updateGrant3',]
// ));


// // Create the workflow object
// const exampleInalidWorkflow = new Workflow('Example Inalid Workflow', invalidWorkflowSteps);

// exampleInalidWorkflow.execute_workflow()



////////////////////// Example workflow with loop /////////////////////////

// const loopWorkflowSteps = new Map<string, WorkflowStep>();


// // Step 1: Wait for 5 seconds 
// loopWorkflowSteps.set('wait1', new WorkflowStep(
//     ActionType.WAIT,
//     { wait_time_seconds: 0.1 },
//     ['wait2']
// ));
// // Step 1: Wait for 5 seconds 
// loopWorkflowSteps.set('wait2', new WorkflowStep(
//     ActionType.WAIT,
//     { wait_time_seconds: 0.2 },
//     ['wait3']
// ));
// // Step 1: Wait for 5 seconds 
// loopWorkflowSteps.set('wait3', new WorkflowStep(
//     ActionType.WAIT,
//     { wait_time_seconds: 0.3 },
//     ['wait1']
// ));
// // Step 1: Wait for 5 seconds 
// loopWorkflowSteps.set('wait4', new WorkflowStep(
//     ActionType.WAIT,
//     { wait_time_seconds: 0.4 },
// ));

// // Create the workflow object
// const exampleloopWorkflow = new Workflow('Example loop Workflow', invalidWorkflowSteps);

// exampleloopWorkflow.execute_workflow()
