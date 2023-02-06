import { Ctx, Query, Resolver } from "type-graphql";
import { User } from "./entity";
import { UserRepo } from "./repo";

@Resolver()
export class UserResolver {
    constructor(private readonly userRepo: UserRepo) { }

    @Query(() => Promise<User | null>)
    async user(@Ctx("user") user: User): Promise<User | null> {
        if (user) {
            this.userRepo.findUserById(user.id);
        }
        return null;
    }
}
