import { ServicesContactDto } from './dto/services-contact.dto';
export declare const SERVICES_CONTACT_URL = "https://manifest.build/api/contact/";
export declare class ServicesContactController {
    contact(dto: ServicesContactDto): Promise<{
        ok: true;
    }>;
}
