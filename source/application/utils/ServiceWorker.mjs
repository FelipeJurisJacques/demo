export class ServiceWorker {

    static support = 'serviceWorker' in navigator

    /**
     * @var ServiceWorkerContainer
     */
    static container

    /**
     * @var ServiceWorkerRegistration
     */
    static registration

    /**
     * @method static
     * @param {URL|String} url 
     * @returns {Promise}
     */
    static register(url) {
        return new Promise(async (resolve, reject) => {
            if (ServiceWorker.support) {
                ServiceWorker.registration = await navigator.serviceWorker.register(url)
                // if (registration.installing) {
                // } else if (registration.waiting) {
                if (ServiceWorker.registration.active) {
                    ServiceWorker.container = ServiceWorker.registration.active
                }
                ServiceWorker.registration.onupdatefound = event => {
                    ServiceWorker.container = event.target.active
                }
                resolve(ServiceWorker)
            } else {
                reject(new Error('ServiceWorker is unsupported'))
            }
        })
    }
}