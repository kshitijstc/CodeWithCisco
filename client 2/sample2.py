# import psutil
# import time
# from datetime import datetime
# import statistics
# import random

# def inject_attack_spikes(packets, bytes_recv, dropped, strength=300):
#     # Simulate strong spike across all metrics
#     tampered_packets = packets + random.randint(strength, strength + 300)
#     tampered_bytes = bytes_recv + random.randint(strength * 1000, strength * 2000)
#     tampered_dropped = dropped + random.randint(20, 50)

#     print(f"  ⚠️  Attack injected → Packets={tampered_packets}, Bytes={tampered_bytes}, Dropped={tampered_dropped}")
#     return tampered_packets, tampered_bytes, tampered_dropped


# def collect_metrics_for_ddos(window_seconds=2, simulate_attack=False):
#     print(f"[*] Starting DDoS Detector... Simulated Attack Mode: {simulate_attack}\n")
#     prev_net = psutil.net_io_counters()

#     try:
#         while True:
#             window_data = []

#             time.sleep(1)

#             for second in range(window_seconds):
#                 current_time = datetime.now()
#                 net = psutil.net_io_counters()

#                 packets_recv = net.packets_recv - prev_net.packets_recv
#                 bytes_recv = net.bytes_recv - prev_net.bytes_recv
#                 dropped = (net.dropin + net.dropout) - (prev_net.dropin + prev_net.dropout)

#                 prev_net = net
#                 print(f"[{current_time}] 📊 Packets={packets_recv}, Bytes={bytes_recv}, Dropped={dropped}")

#                 if simulate_attack:
#                     packets_recv, bytes_recv, dropped = inject_attack_spikes(
#                         packets_recv, bytes_recv, dropped, strength=300
#                     )

#                 window_data.append({
#                     "timestamp": current_time,
#                     "packets_recv_per_sec": packets_recv,
#                     "bytes_recv_per_sec": bytes_recv,
#                     "dropped_packets": dropped
#                 })

#                 time.sleep(1)

#             # Extract metric lists
#             packets = [d["packets_recv_per_sec"] for d in window_data]
#             bytes_ = [d["bytes_recv_per_sec"] for d in window_data]
#             drops = [d["dropped_packets"] for d in window_data]

#             # Thresholds
#             def get_threshold(series):
#                 mean = statistics.mean(series)
#                 std = statistics.stdev(series) if len(series) > 1 else 1
#                 return mean + 1.5 * std


#             packet_thresh = get_threshold(packets)
#             byte_thresh = get_threshold(bytes_)
#             drop_thresh = get_threshold(drops)

#             # Count spikes
#             packet_spikes = sum(p > packet_thresh for p in packets)
#             byte_spikes = sum(b > byte_thresh for b in bytes_)
#             drop_spikes = sum(d > drop_thresh for d in drops)

#             # Rule: If ≥2 metrics have sufficient spikes, flag as DDoS
#             alert = 0
#             if packet_spikes >= 3: alert += 1
#             if byte_spikes >= 3: alert += 1
#             if drop_spikes >= 2: alert += 1

#             if alert >= 1:
#                 print(f"[{datetime.now()}] 🚨 DDoS Attack Detected!")
#                 print(f"    Packets spikes={packet_spikes}, Bytes spikes={byte_spikes}, Drops spikes={drop_spikes}")
#             else:
#                 print(f"[{datetime.now()}] ✅ Normal Traffic — packets mean={statistics.mean(packets):.2f}")

#     except KeyboardInterrupt:
#         print("\n[!] Monitoring stopped by user.")

# if __name__ == '__main__':
#     collect_metrics_for_ddos(simulate_attack=True)


import psutil
import time
from datetime import datetime
import json
import os
import random

# Create logs directory if not exists
os.makedirs("logs", exist_ok=True)
ATTACK_FLAG_PATH = "attack_status.json"
def inject_attack_spikes(packets, bytes_recv, dropped, strength=300):
    tampered_packets = packets + strength
    tampered_bytes = bytes_recv + strength * 2000
    tampered_dropped = dropped + 30
    print(f"  ⚠️  Injected Attack → Packets={tampered_packets}, Bytes={tampered_bytes}, Dropped={tampered_dropped}")
    return tampered_packets, tampered_bytes, tampered_dropped

def isolate_endpoint():
    print("🔒 Isolating suspicious endpoint...")

def reroute_traffic():
    print("🔄 Rerouting traffic to healthy nodes...")

def scale_up_resources():
    print("📈 Scaling up system resources...")

def save_log_to_json(window_number, timestamp, metrics, is_attack):
    log_data = {
        "window": window_number,
        "timestamp": timestamp.isoformat(),
        "metrics": metrics,
        "attack_detected": is_attack
    }
    filename = f"logs/window_{window_number}.json"
    with open(filename, "w") as f:
        json.dump(log_data, f, indent=2)

def collect_metrics_for_demo(window_seconds=3, interval=1):
    print("[*] AegisNet Monitor Initialized...\n")
    prev_net = psutil.net_io_counters()
    window_count = 1

    try:
        while True:
            is_simulated_attack = random.random() < 0.3  # ~30% chance to inject
            print(f"\n🪟 Window #{window_count} | Simulated Attack: {is_simulated_attack}")
            window_data = []

            for _ in range(window_seconds):
                time.sleep(interval)
                current_time = datetime.now()
                net = psutil.net_io_counters()

                packets = net.packets_recv - prev_net.packets_recv
                bytes_recv = net.bytes_recv - prev_net.bytes_recv
                dropped = (net.dropin + net.dropout) - (prev_net.dropin + prev_net.dropout)
                prev_net = net

                if is_simulated_attack:
                    packets, bytes_recv, dropped = inject_attack_spikes(packets, bytes_recv, dropped)

                print(f"[{current_time}] 📊 Packets={packets}, Bytes={bytes_recv}, Dropped={dropped}")
                window_data.append({
                    "timestamp": str(current_time),
                    "packets": packets,
                    "bytes": bytes_recv,
                    "dropped": dropped
                })

            # Fixed thresholds
            packet_thresh = 200
            byte_thresh = 150000
            drop_thresh = 20

            packet_spikes = sum(d["packets"] > packet_thresh for d in window_data)
            byte_spikes = sum(d["bytes"] > byte_thresh for d in window_data)
            drop_spikes = sum(d["dropped"] > drop_thresh for d in window_data)

            is_attack = packet_spikes >= 1 and (byte_spikes >= 1 or drop_spikes >= 1)

            if is_attack:
                print(f"[{datetime.now()}] 🚨 DDoS Attack Detected!")
                print(f"    Packets spikes={packet_spikes}, Bytes spikes={byte_spikes}, Drops spikes={drop_spikes}")
                isolate_endpoint()
                reroute_traffic()
                scale_up_resources()

                # ✅ Write persistent flag
                with open(ATTACK_FLAG_PATH, "w") as f:
                    json.dump({
                        "attack_detected": True,
                        "timestamp": datetime.now().isoformat()
                    }, f)

            else:
                print(f"[{datetime.now()}] ✅ Normal Traffic")


            save_log_to_json(
                window_number=window_count,
                timestamp=datetime.now(),
                metrics=window_data,
                is_attack=is_attack
            )

            window_count += 1

    except KeyboardInterrupt:
        print("\n[!] Monitoring stopped by user.")

if __name__ == '__main__':
    collect_metrics_for_demo()
