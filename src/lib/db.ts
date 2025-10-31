import type { OpenAPIV3_1 } from "$lib/openAPITypes";
import Dexie, { type Table } from 'dexie';
import { persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

export const blankSpec: OpenAPIV3_1.Document = {
	openapi: '3.1.0', // OpenAPI version
	jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema', // JSON Schema version
	info: {
		/** Title of the API (required) */
		title: '',
		/** Description of the API (optional) */
		description: '',
		/** Terms of service link (optional) */
		termsOfService: '',
		/** API Version (required) */
		version: '',
		/** Contact Information */
		contact: {
			/** Name of the contact person/organization. */
			name: '', // optional
			/** URL pointing to the contact information. MUST be in the format of a URL. */
			url: '', // optional
			/** Email address of the contact person/organization. MUST be in the format of an email address. */
			email: '' // optional
		},
		license: {
			name: '', // required if license is included
			url: '' // optional
		}
	},
	servers: [],
	paths: {},
	webhooks: {},
	components: {},
	security: [],
	tags: [],
	externalDocs: {
		description: '',
		url: ''
	}
};

export const newSpec: () => APISpec = () => structuredClone({
    name: 'OpenAPI',
    spec: blankSpec
})

export const selectedSpecId: Writable<string | undefined> = persisted("selectedSpecId",undefined)
export const selectedSpec: Writable<APISpec> = writable(newSpec())

selectedSpec.subscribe((spec) => {
    if(!spec){
        spec = newSpec()
    }
    if(spec.id){
        selectedSpecId.set(spec.id)
    }
})

export const specLoaded: Writable<boolean> = writable(false);
export const pageLoaded: Writable<boolean> = writable(false);

export interface APISpec {
    id?: string;
    name: string;
    spec: OpenAPIV3_1.Document;
}

export class MySubClassedDexie extends Dexie {
    apiSpecs!: Table<APISpec>;

    constructor() {
        super('oasDesigner');
        this.version(1).stores({
            apiSpecs: '++id, name, spec', // Primary key and indexed props
        });
    }
}

export const db = new MySubClassedDexie();

export const loadSpec = (spec: APISpec) => {
    selectedSpec.set(spec)
    selectedSpecId.set(spec.id!)
}

export const saveSpec = async (spec: APISpec) => {
    const clonedSpec = structuredClone(spec)
    let specID
    if (clonedSpec.id) {
        specID = await db.apiSpecs.put(clonedSpec, clonedSpec.id)
    } else {
        specID = await db.apiSpecs.add(clonedSpec)
    }
    return await db.apiSpecs.get(specID)
}