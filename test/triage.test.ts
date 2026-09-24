import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateClinicalTriage } from '../src/services/triageEngine.js';

test('Cardiac Emergency Detection: Left shoulder pain + Chest heaviness', () => {
  const result = evaluateClinicalTriage('Severe chest pain radiating to left shoulder and arm with breathlessness');
  assert.equal(result.status, 'URGENT');
  assert.equal(result.targetAnatomy, 'CHEST/HEART');
  assert.equal(result.referredPainNotice?.type, 'CARDIAC');
  assert.ok(result.actionPlan.action.toLowerCase().includes('emergency'));
});

test('Referred Pain Differentiation: Right shoulder pain + Right abdomen (Gallbladder)', () => {
  const result = evaluateClinicalTriage('Right shoulder pain accompanied by right upper abdomen discomfort and nausea');
  assert.equal(result.targetAnatomy, 'ABDOMEN/DIGESTION');
  assert.equal(result.referredPainNotice?.type, 'GALLBLADDER_LIVER');
  assert.ok(result.referredPainNotice?.description.includes('Gallbladder'));
});

test('Simple Elective Care: Mild cold symptoms', () => {
  const result = evaluateClinicalTriage('Mild runny nose, sneezing, scratchy throat for 2 days');
  assert.equal(result.status, 'SIMPLE');
  assert.ok(result.actionPlan.action.toLowerCase().includes('supportive') || result.actionPlan.action.toLowerCase().includes('home'));
});

test('Musculoskeletal Simple Injury: Ankle sprain without red flags', () => {
  const result = evaluateClinicalTriage('Mild ankle sprain while jogging, slight swelling, can bear partial weight');
  assert.equal(result.status, 'SIMPLE');
  assert.equal(result.targetAnatomy, 'LIMBS/BONES');
});

test('Neurological Emergency Red Flag: Slurred speech', () => {
  const result = evaluateClinicalTriage('Sudden slurred speech and facial droop');
  assert.equal(result.status, 'URGENT');
  assert.ok(result.matchedRedFlags.includes('slurred speech'));
});
