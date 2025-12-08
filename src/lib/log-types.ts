export enum ErrorTypes {
	WRONG_PASSWORD = "wrong_password",
	NOT_LOGGED_IN = "not_logged_in",
	NOT_ADMIN = "not_admin",
	TOS_MISSING = "missing_tos",
	WRONG_FILE_TYPE = "wrong_file_type",
	PIN_MISSING = "missing_pin",
	PASSWORD_MISSMATCH = "password_mismatch",
	STRING_TOO_LONG = "string_too_long",
	EMAIL_USED = "email_used",
	MISSING_API_KEYS = "missing_api_keys",
	USER_NOT_FOUND = "user_not_found",
	INVALID_TOKEN = "invalid_token",
	TOKEN_EXPIRED = "token_expired",
	INVALID_INPUT = "invalid_input",
	ACCOUNT_NOT_ACTIVE = "account_not_active",
	ACCOUNT_DELETED = "account_deleted",
	NO_TARRIF_DATA = "no_tarrif_data",
	INPUT_IS_ZERO = "input_is_zero",
	INPUT_TOO_HIGH = "input_too_high",
	NOT_FOUND = "not_found",
	SENSOR_ALREADY_ASSIGNED = "sensor_already_assigned",
	USER_ALREADY_HAS_SENSOR_TYPE = "user_already_has_sensor_type",
	UNKNOWN = "unknown",
}

export enum LogActionTypes {
	// AUTH
	LOGIN_ACTION = "login_action",
	LOGOUT_ACTION = "logout_action",
	SIGNUP_EXPERIMENT_ACTION = "signup_experiment_action",
	SIGNUP_ACTION = "signup_action",
	FORGOT_PASSWORD_ACTION = "forgot_password_action",
	RESET_PASSWORD_ACTION = "reset_password_action",
	CHANGE_PASSWORD_ACTION = "change_password_action",

	// ACCOUNT
	DELETE_ACCOUNT_ACTION = "delete_account_action",
	UPDATE_ACCOUNT_NAME_ACTION = "update_account_name_action",
	UPDATE_ACCOUNT_INFO_ACTION = "update_account_info_action",

	// GOALS
	UPDATE_ENERGY_GOAL_ACTION = "update_energy_goal_action",

	// REPORTS
	UPDATE_ANOMALY_ACTION = "update_anomaly_action",
	UPDATE_REPORT_CONFIG_ACTION = "update_report_config_action",

	// PROFILE
	UPDATE_HOUSEHOLD_ACTION = "update_household_action",
	UPDATE_ENERGY_TARIFF_ACTION = "update_energy_tariff_action",
	UPDATE_SIMULATION_EV_SETTINGS_ACTION = "update_simulation_ev_settings_action",
	UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION = "update_simulation_solar_settings_action",
	UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION = "update_simulation_heat_pump_settings_action",
	UPDATE_SIMULATION_TOU_SETTINGS_ACTION = "update_simulation_tou_settings_action",
	UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION = "update_simulation_battery_settings_action",
	TOGGLE_SIMULATION_ENABLED_ACTION = "toggle_simulation_enabled_action",

	// DEVICE
	CREATE_DEVICE_ACTION = "create_device_action",
	UPDATE_DEVICE_ACTION = "update_device_action",
	DELETE_DEVICE_ACTION = "delete_device_action",

	// PEAK
	ADD_DEVICE_TO_PEAK_ACTION = "add_device_to_peak_action",
	DELETE_PEAK_ACTION = "delete_peak_action",

	// SENSOR (Admin)
	CREATE_SENSOR_ACTION = "create_sensor_action",
	UPDATE_SENSOR_ACTION = "update_sensor_action",
	ASSIGN_SENSOR_ACTION = "assign_sensor_action",
	REGENERATE_SENSOR_TOKEN_ACTION = "regenerate_sensor_token_action",
}

export enum LogSystemTypes {
	// Energy
	ENERGY_INPUT_V1 = "energy_input_v1",
	ENERGY_INPUT_V2 = "energy_input_v2",

	// Token
	TOKEN_V1 = "token_v1",

	// GAS
	GAS_INPUT_V2 = "gas_input_v2",

	// Data
	DATA_GET_V2 = "data_get_v2",
}
