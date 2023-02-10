import { User, UserModel } from "../entity/User";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middlewares/isAuth";
import { TokenPayload } from "../graphql-types/Context";

@Resolver()
export class UserResolver {

    @UseMiddleware(isAuth)
    @Query(() => User, { nullable: true })
    async user(@Ctx("user") user: TokenPayload): Promise<User | null> {
        console.log(user, "user");
        const u = await UserModel.findById(user.userId).exec();
        return u && u.toObject();
    }
}
