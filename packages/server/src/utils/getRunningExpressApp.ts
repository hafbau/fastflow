import * as Server from '../index'

export const getRunningExpressApp = function () {
    const runningExpressInstance = Server.getInstance()
    if (
        typeof runningExpressInstance === 'undefined' ||
        typeof runningExpressInstance.nodesPool === 'undefined'
    ) {
        throw new Error(`Error: getRunningExpressApp failed!`)
    }
    
    // Ensure telemetry exists, but don't fail if it doesn't
    if (typeof runningExpressInstance.telemetry === 'undefined') {
        console.warn('Warning: Server instance telemetry is undefined')
    }
    
    return runningExpressInstance
}
