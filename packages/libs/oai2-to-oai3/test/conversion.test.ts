import fs from "fs";
import { join } from "path";
import * as datastore from "@azure-tools/datastore";
import { OpenAPI2Document } from "@azure-tools/openapi/v2";
import { ConverterLogger, Oai2ToOai3 } from "../src/converter";

const logger: ConverterLogger = {
  trackError: jest.fn(),
  trackWarning: jest.fn(),
};

const expectConvertingOpenAPI2 = async (openAPI2Name: string, openAPI3Name: string) => {
  const swaggerUri = "mem://swagger.yaml";
  const oai3Uri = "mem://oai3.yaml";

  const swagger = await fs.promises.readFile(join(__dirname, `resources/conversion/oai2/${openAPI2Name}`));
  const oai3 = await fs.promises.readFile(join(__dirname, `resources/conversion/oai3/${openAPI3Name}`));
  const map = new Map<string, string>([
    [swaggerUri, swagger.toString()],
    [oai3Uri, oai3.toString()],
  ]);

  const mfs = new datastore.MemoryFileSystem(map);

  const ds = new datastore.DataStore();
  const scope = ds.getReadThroughScope(mfs);
  const swaggerDataHandle = await scope.Read(swaggerUri);
  const originalDataHandle = await scope.Read(oai3Uri);

  expect(swaggerDataHandle).not.toBeNull();
  expect(originalDataHandle).not.toBeNull();

  if (swaggerDataHandle && originalDataHandle) {
    const swag = await swaggerDataHandle.readObject<OpenAPI2Document>();
    const original = await originalDataHandle.readObject();
    const convert = new Oai2ToOai3(logger, swaggerUri, swag);

    // run the conversion
    await convert.convert();
    expect(convert.generated).toEqual(original);
  }
};

describe("OpenAPI2 -> OpenAPI3 Conversion", () => {
  it("test conversion - ApiManagementClient", async () => {
    await expectConvertingOpenAPI2("ApiManagementClient-swagger.json", "ApiManagementClient-openapi.json");
  });

  it("headers", async () => {
    await expectConvertingOpenAPI2("header.json", "header.json");
  });

  it("additionalProperties", async () => {
    await expectConvertingOpenAPI2("additionalProperties.json", "additionalProperties.json");
  });

  it("xml-service", async () => {
    await expectConvertingOpenAPI2("xml-service.json", "xml-service.json");
  });

  it("xms-error-responses", async () => {
    await expectConvertingOpenAPI2("xms-error-responses.json", "xms-error-responses.json");
  });

  it("validation", async () => {
    await expectConvertingOpenAPI2("validation.json", "validation.json");
  });

  it("storage", async () => {
    await expectConvertingOpenAPI2("storage.json", "storage.json");
  });

  it("url", async () => {
    await expectConvertingOpenAPI2("url.json", "url.json");
  });

  it("url-multi-collectionFormat", async () => {
    await expectConvertingOpenAPI2("url-multi-collectionFormat.json", "url-multi-collectionFormat.json");
  });

  it("complex-model", async () => {
    await expectConvertingOpenAPI2("complex-model.json", "complex-model.json");
  });

  it("extensible-enums-swagger", async () => {
    await expectConvertingOpenAPI2("extensible-enums-swagger.json", "extensible-enums-swagger.json");
  });

  it("lro", async () => {
    await expectConvertingOpenAPI2("lro.json", "lro.json");
  });

  it("exec-service", async () => {
    await expectConvertingOpenAPI2("exec-service.json", "exec-service.json");
  });

  it("LUIS runtime", async () => {
    await expectConvertingOpenAPI2("luis.json", "luis.json");
  });
});
