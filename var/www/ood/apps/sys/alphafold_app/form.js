'use strict';

// SourceURL
//# sourceURL=form.js

// SETUP ----------------------------------------------------------------------------------------------------------------
const gpuDataField = document.getElementById('batch_connect_session_context_gpudata');
const gpuData = JSON.parse(gpuDataField.value);

const memoryDataField = document.getElementById('batch_connect_session_context_memorydata');
const cpuDataField = document.getElementById('batch_connect_session_context_cpunum');

const maxMemoryGB = parseInt(memoryDataField.value) || 512;
const maxCpus = parseInt(cpuDataField.value) || 64;

const minCpuField = document.getElementById('batch_connect_session_context_mincpu');
const minRamField = document.getElementById('batch_connect_session_context_minram');

const minCpus = parseInt(minCpuField?.value || "8", 10);
const minRam = parseInt(minRamField?.value || "16", 10);
// For AlphaFold, enforce at least 16 GB; still ensure 1 GB is shown if needed.
const effectiveMinRam = Math.min(minRam, 16);

// -- GPU Type Dropdown Handling --------------------------------------------------------------
function updateGpuTypeDropdown() {
  const gpuSelect = $('#batch_connect_session_context_gpu_type');
  const gpuCheckbox = $('#batch_connect_session_context_gpu_checkbox');

  gpuSelect.empty();  // Always clear it first

  if (gpuCheckbox.is(':checked')) {
    Object.keys(gpuData.gpu_name_mappings).forEach(gpuId => {
      gpuSelect.append(new Option(gpuData.gpu_name_mappings[gpuId], gpuId));
    });
  } else {
    gpuSelect.append(new Option('none', 'none'));
  }
}

// -- GPU Count Max Handling --------------------------------------------------------------------
function updateGpuCountMax() {
  const selectedGpu = $('#batch_connect_session_context_gpu_type').val();
  const gpuCountField = $('#batch_connect_session_context_gpu_count');

  if (selectedGpu && gpuData.gpu_max_counts[selectedGpu]) {
    gpuCountField.attr('max', gpuData.gpu_max_counts[selectedGpu]);
  } else {
    gpuCountField.attr('max', 1);
  }

  if (selectedGpu === "none") {
    gpuCountField.parent().hide();
  } else {
    gpuCountField.parent().show();
  }
}

// -- GPU Fields Toggle (checkbox) -------------------------------------------------------------
function toggleGpuFields() {
  const gpuCheckbox = $('#batch_connect_session_context_gpu_checkbox');
  const gpuType = $('#batch_connect_session_context_gpu_type');
  const gpuCount = $('#batch_connect_session_context_gpu_count');

  const isHidden = gpuCheckbox.attr('type') === 'hidden';
  let showGpu;

  if (isHidden) {
    showGpu = gpuCheckbox.val() === "1";
  } else {
    showGpu = gpuCheckbox.is(':checked');
  }

  if (showGpu) {
    updateGpuTypeDropdown();
    updateGpuCountMax();
    gpuType.parent().show();
    gpuCount.parent().show();
  } else {
    gpuType.empty();
    gpuType.parent().hide();
    gpuCount.val('1');
    gpuCount.parent().hide();
  }
}

// -- Additional Environment Toggle (checkbox) --------------------------------------------------
function toggleAdditionalEnv() {
  const addEnvCheckbox = $('#batch_connect_session_context_add_env_checkbox');
  const additionalEnv = $('#batch_connect_session_context_additional_environment');

  const showAddEnv = addEnvCheckbox.is(':checked');
  additionalEnv.parent().toggle(showAddEnv);

  if (!showAddEnv) {
    additionalEnv.val('');
  }
}

function toggleMemtask() {
  const memtaskCheckbox = $('#batch_connect_session_context_memtask_checkbox');
  const memtaskField = $('#batch_connect_session_context_memtask');

  const isHidden = memtaskCheckbox.attr('type') === 'hidden';
  let checked;

  if (isHidden) {
    checked = memtaskCheckbox.val() === "1";
  } else {
    checked = memtaskCheckbox.is(':checked');
  }

  if (checked) {
    memtaskCheckbox.val('1');
    memtaskField.parent().show();

    // Dynamically filter memory options based on min/max (enforce >= 16 GB)
    memtaskField.find('option').each(function () {
      const memVal = parseInt($(this).val());
      if (memVal > maxMemoryGB || memVal < effectiveMinRam) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });

    const currentVal = parseInt(memtaskField.val());
    if (currentVal < effectiveMinRam) {
      memtaskField.val(String(effectiveMinRam));
    }

  } else {
    memtaskCheckbox.val('0');
    memtaskField.val(String(effectiveMinRam));
    memtaskField.parent().hide();
  }
}

// INIT ------------------------------------------------------------------------------------------------------------
$(document).ready(function () {
  toggleGpuFields();
  toggleAdditionalEnv();
  toggleMemtask();

  $('#batch_connect_session_context_gpu_checkbox').change(toggleGpuFields);
  $('#batch_connect_session_context_gpu_type').change(updateGpuCountMax);
  $('#batch_connect_session_context_add_env_checkbox').change(toggleAdditionalEnv);
  $('#batch_connect_session_context_memtask_checkbox').change(toggleMemtask);
  $('#batch_connect_session_context_num_cores').attr('max', maxCpus);
  $('#batch_connect_session_context_num_cores').attr('min', minCpus);

  // Enforce default 8 cores and 16 GB where allowed
  const numCoresField = $('#batch_connect_session_context_num_cores');
  const currentCores = parseInt(numCoresField.val(), 10);
  if (currentCores < minCpus) {
    numCoresField.val(minCpus);
  } else {
    numCoresField.val(minCpus);
  }
  const memtaskField = $('#batch_connect_session_context_memtask');
  if (memtaskField.parent().is(':visible')) {
    memtaskField.val(String(effectiveMinRam));
  }
});


