

export class APILogger{
    private recentLogs: any[] = [];
    logRequest(method: string, url: string, headers: Record<string, string>, body?: object){
        const logEntry = {method, url, headers, body};
        this.recentLogs.push({type: 'Request Log', data: logEntry});
    }

    logResponse(statusCode: number, body?: object){
        const logEntry = {statusCode, body};
        this.recentLogs.push({type: 'Response Log', data: logEntry});
    }

    getRecentLogs(){
        const logs = this.recentLogs.map(log => {
            return `===${log.type}===\n${JSON.stringify(log.data, null, 4)}`;
        }).join('\n\n');
        return logs;
    }
}