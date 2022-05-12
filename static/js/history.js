const listeners = [];

export const push = route => {
    const previousRoute = window.location.pathname;
    window.history.pushState(null, null, route);
    listeners.forEach(listener => listener(route, previousRoute));
};

export const listen = fn => {
    listeners.push(fn);
};
