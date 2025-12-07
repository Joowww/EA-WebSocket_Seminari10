export interface IUser {
    id: string;
    name: string;
    socketId: string;
    connectedAt: Date;
}
export class UserManager {
    private users: Map<string, IUser> = new Map();

    addUser(user: IUser): void {
        this.users.set(user.id, user);
    }

    removeUser(socketId: string): IUser | null {
        let removedUser = null;
        for (const [id, user] of this.users.entries()) {
            if (user.socketId === socketId) {
                removedUser = user;
                this.users.delete(id);
                break;
            }
        }
        return removedUser;
    }

    getUserBySocket(socketId: string): IUser | undefined {
        return Array.from(this.users.values()).find(user => user.socketId === socketId);
    }

    getAllUsers(): IUser[] {
        return Array.from(this.users.values());
    }
}