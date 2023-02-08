import { Query, Resolver } from "type-graphql";
import { User } from "./entity";
// import { UserRepo } from "./repo";

@Resolver()
export class UserResolver {
    // constructor(private readonly userRepo: UserRepo) {}

    @Query(() => Promise<User | undefined>)
    async user(): Promise<User | undefined> {
        if (!null) {
            return undefined;
        }
        return undefined;
    }
}
