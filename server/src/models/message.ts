export interface IMessage {
    from: string;         
    content: string;       
    timestamp: string;      
    userId?: string;        
}
export interface IUser {
    id: string;            
    name: string;         
    socketId: string;      
    connectedAt: Date;     
}