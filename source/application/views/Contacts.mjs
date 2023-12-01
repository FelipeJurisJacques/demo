import { Contact } from "../widget/Contact.mjs";
import { Div } from "../widget/Elements.mjs";
import { Window } from "../widget/Window.mjs";

export function Contacts() {
    return Window({}, {
        onDropFile: async function (event) {
            for (let file of event.files) {
                console.log(file)
                if (file.isFile && file.type === 'text/x-vcard') {
                    const content = await file.content
                    const list = content.split('\r\n')
                    const contacts = []
                    let contact
                    for (let item of list) {
                        let parts = item.split(':')
                        if (parts.length !== 2) {
                            continue
                        }
                        let keys = parts[0].split(';')
                        let values = parts[1].split(';')
                        for (let key of keys) {
                            switch (key.toUpperCase()) {
                                case 'END':
                                    if (contact) {
                                        contacts.push(contact)
                                    }
                                    break
                                case 'BEGIN':
                                    contact = {}
                                    break
                                default:
                                    if (contact) {
                                        key = key.toLowerCase()
                                        if (values.length === 1) {
                                            contact[key] = values[0]
                                        } else {
                                            contact[key] = []
                                            for (let value of values) {
                                                if (value) {
                                                    contact[key].push(value)
                                                }
                                            }
                                        }
                                    }
                                    break
                            }
                        }
                    }
                    const elements = []
                    console.log(contacts)
                    for (let contact of contacts) {
                        elements.push(Div({
                            content: contact.fn + '\n' + contact.cell + '\n\r',
                        }))
                    }
                    this.rebuild({
                        children: elements,
                    })
                }
            }
        },
        child: Contact(),
    })
}