export interface IBatchProcessor {
    processBatch(data: any[]): Promise<Map<string, number>>;
    validateBatch(data: any[]): boolean;
    getProcessingStatus(): BatchProcessingStatus;
}

export interface BatchProcessingStatus {
    processedCount: number;
    failedCount: number;
    lastProcessedTimestamp: Date;
}