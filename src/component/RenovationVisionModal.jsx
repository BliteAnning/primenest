import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Sparkles,
  X,
  Loader2,
  Wand2,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  Coins,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { renoVisionContext } from "../context/renoVisionContext";

const STEPS = ["photo", "customize", "style"];

const STEP_LABELS = {
  photo: "Choose a photo",
  customize: "Describe your vision",
  style: "Pick a style (optional)",
};

// Backend only sends key/label/description — these visuals give each style a
// distinct, modern look in the picker without needing preview images.
const STYLE_VISUALS = {
  modern: { gradient: "from-slate-200 via-slate-100 to-white", emoji: "🛋️" },
  afrocentric: { gradient: "from-amber-200 via-orange-200 to-rose-100", emoji: "🌍" },
  luxury: { gradient: "from-yellow-200 via-amber-100 to-white", emoji: "✨" },
  scandinavian: { gradient: "from-sky-100 via-white to-slate-100", emoji: "❄️" },
  industrial: { gradient: "from-zinc-300 via-zinc-200 to-stone-200", emoji: "🏭" },
  classic: { gradient: "from-orange-100 via-amber-50 to-white", emoji: "🏛️" },
};
const DEFAULT_STYLE_VISUAL = { gradient: "from-emerald-100 via-white to-emerald-50", emoji: "🎨" };

const POLL_INTERVAL_MS = 3500;
const MAX_POLL_ATTEMPTS = 34; // ~2 minutes of polling before giving up client-side

export default function RenovationVisionModal({ listing, onClose }) {
  const { getStyles, generateVision, getJobStatus } = useContext(renoVisionContext);

  const photos = useMemo(
    () => (listing?.media || []).filter((item) => item?.type === "photo" && item?.url),
    [listing]
  );

  const [step, setStep] = useState("photo");
  const [styles, setStyles] = useState([]);
  const [stylesLoading, setStylesLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0] || null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState("Sending your photo to the AI designer...");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const pollTimerRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getStyles();
        if (isMounted) setStyles(data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load renovation styles. Please try again.");
      } finally {
        if (isMounted) setStylesLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [getStyles]);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const beginPolling = (jobId) => {
    pollAttemptsRef.current = 0;
    pollTimerRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;

      try {
        const data = await getJobStatus(jobId);

        if (data.status === "succeeded") {
          stopPolling();
          setResult(data.result);
          setGenerating(false);
          setStep("result");
          toast.success("Your renovation vision is ready!");
          return;
        }

        if (data.status === "failed" || data.status === "timeout") {
          stopPolling();
          setGenerating(false);
          setStep("customize");
          const message = data.error || "Generation failed. Please try again.";
          setErrorMessage(message);
          toast.error(message);
          return;
        }

        if (data.message) {
          setProgressMessage(data.message);
        }
      } catch (err) {
        console.error(err);
      }

      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setGenerating(false);
        setStep("customize");
        setErrorMessage("This is taking longer than expected. Please try again in a moment.");
      }
    }, POLL_INTERVAL_MS);
  };

  const goToStep = (target) => {
    if (generating) return;
    setErrorMessage("");
    setStep(target);
  };

  const handleGenerate = async (forceRegenerate = false) => {
    if (!selectedPhoto) {
      toast.error("Please select a photo first.");
      setStep("photo");
      return;
    }
    if (!customPrompt.trim()) {
      toast.error("Please describe how you'd like this room redesigned.");
      setStep("customize");
      return;
    }

    setErrorMessage("");
    setGenerating(true);
    setProgressMessage("Sending your photo to the AI designer...");
    setStep("generating");

    try {
      const response = await generateVision({
        listingId: listing._id,
        mediaId: selectedPhoto._id,
        style: selectedStyle?.key,
        customPrompt: customPrompt.trim(),
        forceRegenerate,
      });

      if (response.cached && response.existingRender) {
        setGenerating(false);
        setResult({
          style: response.existingRender.style,
          styleLabel: selectedStyle.label,
          originalImageUrl: response.existingRender.originalImageUrl,
          generatedImageUrl: response.existingRender.generatedImageUrl,
          costEstimate: {
            min: response.existingRender.estimatedCostMin,
            max: response.existingRender.estimatedCostMax,
            currency: "GHS",
          },
          cached: true,
        });
        setStep("result");
        toast.success("Showing an existing render for this style.");
        return;
      }

      if (response.jobId) {
        beginPolling(response.jobId);
      } else {
        throw new Error("No generation job was started.");
      }
    } catch (err) {
      console.error(err);
      setGenerating(false);
      setStep("customize");
      const message =
        err?.response?.data?.message || err.message || "We could not start the generation. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (generating) {
      stopPolling();
      setGenerating(false);
    }
    onClose();
  };

  const resetForNewStyle = () => {
    setSelectedStyle(null);
    setResult(null);
    setErrorMessage("");
    setStep("style");
  };

  const currentStepIndex = STEPS.indexOf(step === "generating" || step === "result" ? "style" : step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-3 py-6 backdrop-blur-sm sm:px-4"
      onClick={generating ? undefined : handleClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-6 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Sparkles size={14} /> AI Renovation Vision
              </div>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Redecorate this space</h2>
              <p className="mt-1 max-w-lg text-sm text-emerald-50/90">
                Pick a photo, describe how you'd like it redesigned, and optionally choose a style for extra
                inspiration — our AI designer handles the rest, with a Ghana-specific cost estimate.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={generating}
              className="shrink-0 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {step !== "result" && (
            <div className="relative mt-6 flex items-center gap-2">
              {STEPS.map((s, index) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index <= currentStepIndex ? "bg-white text-emerald-700" : "bg-white/20 text-white"
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle2 size={14} /> : index + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-semibold sm:block ${
                      index <= currentStepIndex ? "text-white" : "text-white/60"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded-full ${index < currentStepIndex ? "bg-white" : "bg-white/25"}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {errorMessage && step !== "generating" && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span className="mt-0.5">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {step === "photo" && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Which photo should we redesign?</h3>
              <p className="mt-1 text-sm text-slate-500">Choose the room you'd like to visualize in a new style.</p>

              {photos.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  This listing does not have any photos to redesign yet.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo) => (
                    <button
                      key={photo._id}
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition ${
                        selectedPhoto?._id === photo._id
                          ? "border-emerald-500 ring-2 ring-emerald-200"
                          : "border-transparent hover:border-emerald-200"
                      }`}
                    >
                      <img src={photo.url} alt={photo.caption || "Listing photo"} className="h-28 w-full object-cover sm:h-32" />
                      {selectedPhoto?._id === photo._id && (
                        <div className="absolute right-2 top-2 rounded-full bg-emerald-600 p-1 text-white shadow">
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "customize" && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Describe your vision</h3>
              <p className="mt-1 text-sm text-slate-500">
                Required — tell the AI how you'd like this room redesigned. Be as specific as you like.
              </p>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                <div className="overflow-hidden rounded-2xl border border-slate-200 sm:w-40 sm:shrink-0">
                  <img src={selectedPhoto?.url} alt="Selected" className="h-28 w-full object-cover sm:h-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={customPrompt}
                    onChange={(event) => setCustomPrompt(event.target.value.slice(0, 300))}
                    rows={5}
                    maxLength={300}
                    placeholder="e.g. add a reading nook by the window, warm wood tones, keep the ceiling white..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                  <p className="text-right text-xs text-slate-400">{customPrompt.length}/300</p>
                </div>
              </div>
            </div>
          )}

          {step === "style" && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Pick a style (optional)</h3>
              <p className="mt-1 text-sm text-slate-500">
                Adds extra colour and material cues on top of your description above — skip it if you'd rather
                the AI focus purely on what you wrote.
              </p>

              {stylesLoading ? (
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={18} /> Loading styles...
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {styles.map((style) => {
                    const visual = STYLE_VISUALS[style.key] || DEFAULT_STYLE_VISUAL;
                    const isActive = selectedStyle?.key === style.key;
                    return (
                      <button
                        key={style.key}
                        type="button"
                        onClick={() => setSelectedStyle(style)}
                        className={`rounded-2xl border-2 bg-gradient-to-br p-4 text-left transition ${visual.gradient} ${
                          isActive ? "border-emerald-500 ring-2 ring-emerald-200" : "border-transparent hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{visual.emoji}</span>
                          {isActive && <CheckCircle2 className="text-emerald-600" size={18} />}
                        </div>
                        <p className="mt-3 font-semibold text-slate-900">{style.label}</p>
                        <p className="mt-1 text-xs text-slate-600">{style.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "generating" && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200/60" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Wand2 size={26} />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">Designing your dream room...</p>
                <p className="mt-1 text-sm text-slate-500">{progressMessage}</p>
                <p className="mt-1 text-xs text-slate-400">This usually takes 15-30 seconds.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopPolling();
                  setGenerating(false);
                  setStep("customize");
                }}
                className="text-sm font-semibold text-slate-500 underline hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          )}

          {step === "result" && result && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  {result.styleLabel || selectedStyle?.label
                    ? `Here's your ${result.styleLabel || selectedStyle?.label} vision`
                    : "Here's your redesigned space"}
                  {result.cached && <span className="font-normal text-emerald-600">(previously generated)</span>}
                </div>
                {result.cached && (
                  <button
                    type="button"
                    onClick={() => handleGenerate(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <RefreshCcw size={13} /> Generate new version
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
                  <img src={result.originalImageUrl} alt="Before" className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">After</p>
                  <img src={result.generatedImageUrl} alt="After" className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                </div>
              </div>

              <a
                href={result.generatedImageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
              >
                <ExternalLink size={14} /> Open full-size image
              </a>

              {result.costEstimate && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Coins size={16} className="text-emerald-600" /> Estimated renovation cost
                  </div>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {result.costEstimate.currency || "GHS"} {result.costEstimate.min?.toLocaleString()} –{" "}
                    {result.costEstimate.max?.toLocaleString()}
                  </p>

                  {result.costEstimate.breakdown && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {Object.entries(result.costEstimate.breakdown).map(([key, value]) => (
                        <div key={key} className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                          <p className="font-semibold capitalize text-slate-800">{key}</p>
                          <p>
                            GHS {value.min?.toLocaleString()} – {value.max?.toLocaleString()}
                          </p>
                          {(value.material || value.treatment || value.type || value.note) && (
                            <p className="mt-0.5 text-slate-400">{value.material || value.treatment || value.type || value.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.costEstimate.disclaimer && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
                      <ShieldCheck size={13} className="mt-0.5 shrink-0" /> {result.costEstimate.disclaimer}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "generating" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:px-8">
            {step === "photo" && (
              <>
                <span className="text-xs text-slate-400">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} available
                </span>
                <button
                  type="button"
                  disabled={!selectedPhoto}
                  onClick={() => goToStep("customize")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next <ArrowRight size={15} />
                </button>
              </>
            )}

            {step === "customize" && (
              <>
                <button
                  type="button"
                  onClick={() => goToStep("photo")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="button"
                  disabled={!customPrompt.trim()}
                  onClick={() => goToStep("style")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next <ArrowRight size={15} />
                </button>
              </>
            )}

            {step === "style" && (
              <>
                <button
                  type="button"
                  onClick={() => goToStep("customize")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Wand2 size={16} /> Generate my vision
                </button>
              </>
            )}

            {step === "result" && (
              <>
                <button
                  type="button"
                  onClick={resetForNewStyle}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCcw size={15} /> Try another style
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Done
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
