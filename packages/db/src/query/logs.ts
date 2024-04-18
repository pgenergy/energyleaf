import db from "../index";
import {logs} from "../schema/logs";

export type LogType = {
    logType: string;
    branch: string;
    deploymentDomain: string;
    deploymentId: string;
    environment: string;
    function: string;
    host: string;
    lambdaDurationInMs: number;
    lambdaMaxMemoryUsed: number;
    lambdaMemorySize: number;
    lambdaRegion: vtring;
    level: string;
    message: string;
    projectId: string;
    requestId: string;
    requestMethod: string;
    requestPath: string;
    requestUserAgent: string;
    responseStatusCode: number;
    timestampInMs: number;
    timeUTC: string;
    type: string;
    vercelCache: string;
    wafAction: vstring;
};

export async function insertLog(data: LogType) {
    await db.insert(logs).values({
        logType: data.logType,
        branch: data.branch,
        deploymentDomain: data.deploymentDomain,
        deploymentId: data.deploymentId,
        environment: data.environment,
        function: data.function,
        host: data.host,
        lambdaDurationInMs: data.lambdaDurationInMs,
        lambdaMaxMemoryUsed: data.lambdaMaxMemoryUsed,
        lambdaMemorySize: data.lambdaMemorySize,
        lambdaRegion: data.lambdaRegion,
        level: data.level,
        message: data.message,
        projectId: data.projectId,
        requestId: data.requestId,
        requestMethod: data.requestMethod,
        requestPath: data.requestPath,
        requestUserAgent: data.requestUserAgent,
        responseStatusCode: data.responseStatusCode,
        timestampInMs: data.timestampInMs,
        timeUTC: data.timeUTC,
        type: data.type,
        vercelCache: data.vercelCache,
        wafAction: data.wafAction,
    });
}