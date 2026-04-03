import { getOllamaConfig } from "../../../lib/chat-flags";

export const dynamic = "force-dynamic";

/**
 * GET /api/ollama-health — verifies env is loaded and the local Ollama daemon responds.
 * Does not expose API keys.
 *
 * `?probe=1` — runs a tiny **inference** (POST /api/generate). Tags alone do not prove the model can run;
 * use this if chat returns HTTP 500 "runner process has terminated".
 */
export async function GET(req: Request) {
  const cfg = getOllamaConfig();
  if (!cfg) {
    return Response.json(
      {
        ok: false,
        configured: false,
        ollamaReachable: null,
        hint: "Set PAGE_BUILDER_CHAT_OLLAMA_URL (or OLLAMA_HOST) in apps/page-builder-chat/.env and restart dev.",
      },
      { status: 200 }
    );
  }

  const search = new URL(req.url).searchParams;
  const probe = search.get("probe") === "1" || search.get("inference") === "1";

  try {
    const r = await fetch(`${cfg.url}/api/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const reachable = r.ok;
    let modelNames: string[] = [];
    if (reachable) {
      const data = (await r.json()) as { models?: { name?: string }[] };
      modelNames = (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
    }

    let inferenceProbe: {
      ok: boolean;
      httpStatus?: number;
      error?: string;
      responsePreview?: string;
      usedCpuOnly?: boolean;
      gpuAttemptFailed?: boolean;
      gpuAttemptError?: string;
    } | null = null;

    if (probe && reachable) {
      try {
        const runGenerate = async (numGpu?: number) => {
          const options: Record<string, number> = { num_ctx: 256, num_predict: 16 };
          if (numGpu !== undefined) {
            options.num_gpu = numGpu;
          }
          const gen = await fetch(`${cfg.url}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(120_000),
            body: JSON.stringify({
              model: cfg.model,
              prompt: "Reply with exactly: OK",
              stream: false,
              options,
            }),
          });
          const text = await gen.text();
          let preview = text.slice(0, 200);
          if (gen.ok) {
            try {
              const j = JSON.parse(text) as { response?: string };
              preview = (j.response ?? text).slice(0, 200);
            } catch {
              /* keep raw */
            }
          }
          return { gen, text, preview };
        };

        const first = await runGenerate();
        if (first.gen.ok) {
          inferenceProbe = {
            ok: true,
            httpStatus: first.gen.status,
            responsePreview: first.preview,
            usedCpuOnly: false,
          };
        } else {
          const second = await runGenerate(0);
          inferenceProbe = {
            ok: second.gen.ok,
            httpStatus: second.gen.status,
            error: second.gen.ok ? undefined : second.text.slice(0, 500),
            responsePreview: second.preview,
            usedCpuOnly: second.gen.ok,
            gpuAttemptFailed: true,
            gpuAttemptError: first.text.slice(0, 500),
          };
        }
      } catch (e) {
        inferenceProbe = {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }

    const tagsOk = reachable;
    const inferenceOk = inferenceProbe === null ? null : inferenceProbe.ok;
    const ok = tagsOk && (inferenceOk === null || inferenceOk === true);

    return Response.json({
      ok,
      configured: true,
      url: cfg.url,
      modelConfigured: cfg.model,
      ollamaReachable: reachable,
      httpStatus: r.status,
      modelsOnServer: modelNames,
      inferenceProbe,
      hint: (() => {
        if (!probe || !inferenceProbe) {
          return undefined;
        }
        if (!inferenceProbe.ok) {
          return (
            "Inference failed (GPU and CPU retries). Not an app bug — fix Ollama: update from ollama.com, run `ollama pull " +
            cfg.model +
            "`, try `llama3.2:1b`, or free RAM. NVIDIA: update drivers; you can also set CUDA_VISIBLE_DEVICES=-1 for Ollama (CPU-only)."
          );
        }
        if (inferenceProbe.gpuAttemptFailed && inferenceProbe.usedCpuOnly) {
          return (
            "GPU inference failed but CPU worked. Add PAGE_BUILDER_CHAT_OLLAMA_NUM_GPU=0 to apps/page-builder-chat/.env and restart dev so chat uses CPU-only."
          );
        }
        return undefined;
      })(),
    });
  } catch (e) {
    return Response.json({
      ok: false,
      configured: true,
      url: cfg.url,
      modelConfigured: cfg.model,
      ollamaReachable: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
