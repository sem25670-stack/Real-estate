import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      // Stream the asset through the app so browsers render it inline. A raw
      // redirect can inherit an attachment disposition from object storage and
      // makes filenames containing spaces fragile in signed CloudFront URLs.
      const assetResp = await fetch(encodeURI(url));
      if (!assetResp.ok) {
        console.error(`[StorageProxy] asset fetch failed: ${assetResp.status}`);
        res.status(502).send("Stored image unavailable");
        return;
      }
      const contentType = assetResp.headers.get("content-type") || "application/octet-stream";
      const bytes = Buffer.from(await assetResp.arrayBuffer());
      res.set("Content-Type", contentType);
      res.set("Content-Disposition", "inline");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(bytes);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
