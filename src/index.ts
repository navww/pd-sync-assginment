import dotenv from "dotenv";
import axios from "axios";
import type { PipedrivePerson } from "./types/pipedrive";
import inputData from "./mappings/inputData.json";
import mappings from "./mappings/mappings.json";

dotenv.config();

const API_KEY = process.env.PIPEDRIVE_API_KEY;
const COMPANY_DOMAIN = process.env.PIPEDRIVE_COMPANY_DOMAIN;
const BASE_URL = "https://api.pipedrive.com/v1";

const getValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
};

const syncPdPerson = async (): Promise<PipedrivePerson> => {
  if (!API_KEY || !COMPANY_DOMAIN) {
    throw new Error("Missing PIPEDRIVE_API_KEY or PIPEDRIVE_COMPANY_DOMAIN env vars");
  }

  const personPayload: Record<string, any> = {};

  mappings.forEach((mapping) => {
    const value = getValue(inputData, mapping.inputKey);
    if (value !== undefined) {
      personPayload[mapping.pipedriveKey] = value;
    }
  });

  const nameMapping = mappings.find((m) => m.pipedriveKey === "name");
  const nameValue = personPayload["name"];

  if (!nameValue) {
    throw new Error("Name value is required for sync");
  }

  try {
    const { data: searchData } = await axios.get(`${BASE_URL}/persons/search`, {
      params: {
        term: nameValue,
        api_token: API_KEY,
        exact_match: true
      },
    });

    const existingPerson = searchData.data?.items?.find((item: any) => item.item.name === nameValue);

    if (existingPerson) {
      console.log(`Updating existing person: ${nameValue} (ID: ${existingPerson.item.id})`);
      const { data: updateData } = await axios.put<{ data: PipedrivePerson }>(
        `${BASE_URL}/persons/${existingPerson.item.id}`,
        personPayload,
        { params: { api_token: API_KEY } }
      );
      return updateData.data;
    } else {
      console.log(`Creating new person: ${nameValue}`);
      const { data: createData } = await axios.post<{ data: PipedrivePerson }>(
        `${BASE_URL}/persons`,
        personPayload,
        { params: { api_token: API_KEY } }
      );
      return createData.data;
    }

  } catch (error: any) {
    console.error("Sync Error:", axios.isAxiosError(error) ? error.response?.data : error.message);
    throw error;
  }
};

syncPdPerson()
  .then((person) => console.log("Result:", person))
  .catch((err) => console.error("Failed:", err));
