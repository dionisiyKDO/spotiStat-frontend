import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = ({ params }) => {
    return { userOne: params.userOne, userTwo: params.userTwo };
};
