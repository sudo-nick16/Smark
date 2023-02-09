import { User } from "../entity/User";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middlewares/isAuth";
import { TokenPayload } from "../graphql-types/Context";
import { UserRepo } from "../repository/UserRepo";

@Resolver()
export class UserResolver {
    constructor(private readonly userRepo: UserRepo) { }

    @UseMiddleware(isAuth)
    @Query(() => User, { nullable: true })
    async user(@Ctx("user") user: TokenPayload): Promise<User | null> {
        console.log(user, "user");
        return this.userRepo.findUserById(user!.userId);
    }
}
