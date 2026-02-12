# Triton Evaluation Plan (Stub-Model Phase)

This project is still in stub-model mode. We keep model execution mocked, but we can still prepare and benchmark serving infrastructure before plugging in a real model.

## Goal

Decide whether to run production inference through:

1. NVIDIA Triton Inference Server
2. Custom Python runtime (current provider pattern)

## Decision Criteria

- `p95` latency under concurrent load
- Throughput (`jobs/sec`) with batching enabled
- GPU utilization stability
- Cold start / model swap time
- Operational complexity (rollouts, observability, debugging)

## Benchmark Protocol

1. Prepare same model artifacts in both runtimes.
2. Run identical input corpus and concurrency profile.
3. Collect:
   - request latency distribution
   - queue lag
   - GPU memory and SM utilization
   - error rate and timeout rate
4. Compare cost/performance.

## Initial Recommendation

- Keep custom runtime for fast iteration while model is unstable.
- Move to Triton when model formats and preprocessing are fixed and batching wins are measurable.

## Deliverables to complete decision

- Reproducible benchmark script with fixed seeds.
- Prometheus dashboards for latency/queue/GPU.
- Rollback playbook for model runtime switch.
