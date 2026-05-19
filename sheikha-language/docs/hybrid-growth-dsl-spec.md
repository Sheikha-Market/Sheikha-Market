# Hybrid Growth DSL Specification

## Purpose
This DSL defines a compact language for modeling hybrid engineering systems using two analogies:
- Human-oriented decision behavior.
- Plant-oriented growth behavior.

It is designed to integrate with Sheikha runtime governance and evaluation rules.

## Core Model
A program expresses:
- service metadata
- human profile
- plant profile
- hybrid profile
- measurable KPIs
- acceptance gates

## Grammar (High-Level)
```ebnf
program        = "service" identifier "{" section+ "}" ;
section        = humanSection | plantSection | hybridSection | kpiSection | gateSection ;
humanSection   = "human" "{" kvpair+ "}" ;
plantSection   = "plant" "{" kvpair+ "}" ;
hybridSection  = "hybrid" "{" kvpair+ "}" ;
kpiSection     = "kpi" "{" metric+ "}" ;
gateSection    = "gates" "{" gate+ "}" ;
metric         = identifier ":" number ;
gate           = identifier ":" ("required" | "optional") ;
kvpair         = identifier ":" value ;
value          = string | number | boolean ;
identifier     = /[a-zA-Z_][a-zA-Z0-9_]*/ ;
```

## Example
```text
service scrapMatching {
  human {
    decision_accuracy: 92
    response_latency_ms: 180
    logic_error_rate: 1.2
  }

  plant {
    root_depth: 88
    nutrition_quality: 84
    growth_stability: 90
    fruit_value: 86
  }

  hybrid {
    scale_resilience: 91
    fault_recovery: 87
    value_alignment: 89
  }

  kpi {
    availability: 99.93
    p95_latency_ms: 240
    trace_coverage: 100
  }

  gates {
    io_contract: required
    decision_audit_log: required
    fault_isolation: required
    slo_defined: required
    pre_root_expansion_block: required
  }
}
```

## Score Calculation
Let:
- H = average of human metrics
- P = average of plant metrics
- X = average of hybrid metrics

Then:
$$
FinalScore = 0.35H + 0.35P + 0.30X
$$

## Runtime Integration Contract
A compliant compiler/runtime should emit:
- normalized JSON profile
- computed score card
- gate validation result
- recommendation: ready, conditional, rejected

## Output Schema (Conceptual)
```json
{
  "service": "string",
  "human": {"score": 0},
  "plant": {"score": 0},
  "hybrid": {"score": 0},
  "finalScore": 0,
  "gates": {"requiredPassed": true},
  "status": "ready|conditional|rejected"
}
```
