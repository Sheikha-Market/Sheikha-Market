# -*- coding: utf-8 -*-
import os, json, math, time

def generate_robot_kinematics():
    reg_path = "SHEIKHA-CORE/blockchain/registry.json"
    if not os.path.exists(reg_path):
        reg_path = "blockchain/registry.json"
        
    weights = []
    if os.path.exists(reg_path):
        try:
            with open(reg_path, "r", encoding="utf-8") as f:
                d = json.load(f)
                if isinstance(d, dict):
                    if "weights" in d and isinstance(d["weights"], list):
                        weights = d["weights"]
                    else:
                        weights = list(d.values())
                elif isinstance(d, list):
                    weights = d
        except Exception as e:
            print(f"Error loading registry: {e}")
            weights = []

    # تنقية العناصر لضمان أنها قواميس صالحة
    clean_weights = [w for w in weights if isinstance(w, dict)]

    phi = (1 + math.sqrt(5)) / 2
    joints_map = [
        "joint_1_foundation_z", "joint_2_forging_y", "joint_3_builder_z",
        "joint_4_compute_x", "joint_5_ledger_y", "joint_6_trade_z", "joint_7_carrier_cont"
    ]

    kinematics_data = {
        "timestamp": int(time.time()),
        "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
        "total_weights_processed": len(clean_weights),
        "golden_ratio_phi": phi,
        "joint_trajectory_frames": []
    }

    for idx, w in enumerate(clean_weights[:150]):
        angles = {}
        for j_idx, j_name in enumerate(joints_map):
            raw_angle = ((idx + j_idx + 1) * phi * math.pi) % (2 * math.pi) - math.pi
            angles[j_name] = round(raw_angle, 4)
        kinematics_data["joint_trajectory_frames"].append({
            "weight_id": w.get("id", f"WEIGHT_{idx}"),
            "shk_reward": w.get("shk_reward", 0),
            "angles": angles
        })

    out_file = "public/robot/kinematics_weights.json"
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(kinematics_data, f, indent=2, ensure_ascii=False)

    print(f"✅ تم توليد زوايا المفاصل الحركية لـ {len(clean_weights)} وزناً بنجاح في: {out_file}")

if __name__ == "__main__":
    generate_robot_kinematics()
