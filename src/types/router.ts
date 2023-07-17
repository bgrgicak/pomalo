enum MenuType {
    Main = "main",
    Header = "header",
};

export { MenuType };

interface Route {
    path: string;
    name: string;
    component: () => Promise<any>;
    icon?: string;
    menu: MenuType[];
};

export default Route;