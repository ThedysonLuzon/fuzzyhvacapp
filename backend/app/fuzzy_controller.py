# backend/app/fuzzy_controller.py

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

def build_controller() -> ctrl.ControlSystemSimulation:
    """
    Create and return a fresh ControlSystemSimulation for the HVAC fuzzy controller.
    """
    # Define fuzzy variables
    indoor = ctrl.Antecedent(np.arange(15, 31, 1), 'indoor_temp')
    occupancy = ctrl.Antecedent(np.arange(0, 101, 1), 'occupancy')
    outdoor = ctrl.Antecedent(np.arange(-10, 46, 1), 'outdoor_temp')
    power = ctrl.Consequent(np.arange(0, 11, 1), 'hvac_power')

    # Membership functions for indoor temperature
    indoor['cold'] = fuzz.trimf(indoor.universe, [15, 15, 20])
    indoor['comfortable'] = fuzz.trimf(indoor.universe, [19, 22.5, 26])
    indoor['hot'] = fuzz.trimf(indoor.universe, [24, 30, 30])

    # Membership functions for occupancy
    occupancy['low'] = fuzz.trimf(occupancy.universe, [0, 0, 40])
    occupancy['medium'] = fuzz.trimf(occupancy.universe, [30, 50, 70])
    occupancy['high'] = fuzz.trimf(occupancy.universe, [60, 100, 100])

    # Membership functions for outdoor temperature
    outdoor['cold'] = fuzz.trimf(outdoor.universe, [-10, -10, 10])
    outdoor['mild'] = fuzz.trimf(outdoor.universe, [5, 18, 30])
    outdoor['hot'] = fuzz.trimf(outdoor.universe, [25, 45, 45])

    # Membership functions for HVAC power
    power['low'] = fuzz.trimf(power.universe, [0, 0, 4])
    power['moderate'] = fuzz.trimf(power.universe, [3, 5.5, 8])
    power['high'] = fuzz.trimf(power.universe, [7, 10, 10])

    # Define the rule base
    rules = [
        ctrl.Rule(indoor['cold'] & occupancy['high'], power['high']),
        ctrl.Rule(indoor['cold'] & occupancy['low'], power['moderate']),
        ctrl.Rule(indoor['comfortable'] & outdoor['mild'], power['low']),
        ctrl.Rule(indoor['hot'] & occupancy['high'], power['high']),
        ctrl.Rule(outdoor['hot'] & indoor['comfortable'], power['moderate']),
        ctrl.Rule(occupancy['low'] & indoor['comfortable'], power['low']),
        ctrl.Rule(outdoor['cold'] & indoor['comfortable'] & occupancy['high'], power['moderate']),
    ]

    system = ctrl.ControlSystem(rules)
    return ctrl.ControlSystemSimulation(system)


def build_controller_sim(indoor: float, occupancy: float, outdoor: float) -> float:
    """
    Run one fuzzy control simulation and return the HVAC power (0–10).
    """
    sim = build_controller()
    sim.input['indoor_temp'] = indoor
    sim.input['occupancy']    = occupancy
    sim.input['outdoor_temp'] = outdoor

    try:
        sim.compute()
    except Exception as e:
        print(f"[build_controller_sim] compute error: {e}")
        return 0.0

    val = sim.output.get('hvac_power')
    if val is None:
        print(f"[build_controller_sim] missing 'hvac_power' in output: {sim.output}")
        return 0.0
    return float(val)


def naive_thermostat(indoor_temp: float, setpoint: float = 22.5, deadband: float = 1.0) -> float:
    """
    Traditional thermostat: full power (10) if outside deadband, else off (0).
    """
    if indoor_temp < setpoint - deadband or indoor_temp > setpoint + deadband:
        return 10.0
    return 0.0
