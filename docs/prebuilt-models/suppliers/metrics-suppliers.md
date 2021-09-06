---
sidebar_position: 3
sidebar_label: Visualization
---

# Metrics Suppliers

## The `WorkloadResourceUsageSupplier` Model

Used to get the numbers necessary to show gauges and batteries.

### Example

```yaml title="examples/descriptors/suppliers/metrics_suppliers.yaml"
kind: WorkloadResourceUsageSupplier
id: "example.supplier.workload-res-usage"
resource_selectors:
  - "expr::Deployment:monolith"
metric_type: "memory"
upper_bound_type: "memory_limit"
```

Result:

```python title="$ python main.py console"
>>> supplier = Supplier.inflate("example.supplier.workload-res-usage")
>>> supplier.resolve()
{'usage': 148791296.0, 'upper_bound': 250000000.0, 'fraction_used': 0.595165184, 'pct_used': 59}
```
