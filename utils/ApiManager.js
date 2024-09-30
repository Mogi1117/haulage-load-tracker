import { CallApi, SubmitCallApi } from "./ApiCall";

export const getDrivers = (method, url) => {
    return CallApi(method, url);
};

export const getTrucks = (method, url) => {
    return CallApi(method, url);
};

export const getConfigurations = (method, url) => {
    return CallApi(method, url);
};

export const getPits = (method, url) => {
    return CallApi(method, url);
};

export const getLoaders = (method, url) => {
    return CallApi(method, url);
};

export const submitFormData=(method, url, data)=>{
    return SubmitCallApi(method, url, data);
}
 