import { User, UserModel } from "../entity/User";

export interface UserRepoImpl {
    findUserById(id: string): Promise<User | null>;
    findUserByUsername(username: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
}

export class UserRepo implements UserRepoImpl {
    async findUserById(id: string): Promise<User | null> {
        const user = await UserModel.findById(id);
        return user?.toObject() || null;
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const user = await UserModel.findOne({
            username
        });
        return user?.toObject() || null;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({
            email
        });
        return user?.toObject() || null;
    }
}
