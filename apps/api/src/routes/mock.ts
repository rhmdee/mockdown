import { Elysia, t } from "elysia";
import { getMockData } from "../services/cache-store";

export const mockRoutes = new Elysia({ prefix: "/api/mock" })
  .get(
    "/:id",
    ({ params: { id }, set }) => {
      const entry = getMockData(id);
      if (!entry) {
        set.status = 404;
        return {
          error: "Not Found",
          message: `Mock endpoint with ID '${id}' not found or has expired.`
        };
      }

      return entry.payload.mockData;
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  )
  .get(
    "/:id/:tableName",
    ({ params: { id, tableName }, set }) => {
      const entry = getMockData(id);
      if (!entry) {
        set.status = 404;
        return {
          error: "Not Found",
          message: `Mock endpoint with ID '${id}' not found or has expired.`
        };
      }

      const tables = entry.payload.mockData;
      // Check case-insensitive match for table name
      const matchedKey = Object.keys(tables).find(
        (key) => key.toLowerCase() === tableName.toLowerCase()
      );

      if (!matchedKey || !tables[matchedKey]) {
        set.status = 404;
        return {
          error: "Not Found",
          message: `Table '${tableName}' not found in mock endpoint '${id}'. Available tables: ${Object.keys(tables).join(", ")}`
        };
      }

      return tables[matchedKey];
    },
    {
      params: t.Object({
        id: t.String(),
        tableName: t.String()
      })
    }
  );
