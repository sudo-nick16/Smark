import { User } from "../entity/User";
import { UserMongo } from "../models/UserModel";

export interface UserRepoImpl {
    findUserById(id: string): Promise<User | undefined>;
    findUserByUsername(username: string): Promise<User | undefined>;
    findUserByEmail(email: string): Promise<User | undefined>;
}

export class UserRepo implements UserRepoImpl {
    async findUserById(id: string): Promise<User | undefined> {
        const user = await UserMongo.findById(id);
        return user?.toObject();
    }

    async findUserByUsername(username: string): Promise<User | undefined> {
        const user = await UserMongo.findOne({
            username
        });
        return user?.toObject();
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        const user = await UserMongo.findOne({
            email
        });
        return user?.toObject();
    }
}
