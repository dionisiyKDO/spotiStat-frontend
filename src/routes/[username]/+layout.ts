import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = ({ params }) => {
    return { username: params.username };
};
