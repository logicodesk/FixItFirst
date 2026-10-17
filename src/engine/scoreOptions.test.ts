import { describe, it, expect } from 'vitest';
import { scoreOptions, detectCategory } from './scoreOptions';

describe('scoreOptions Rule Engine', () => {
  it('correctly evaluates the Desk lamp demo case according to specification', () => {
    const result = scoreOptions('Desk lamp', 'broken', "Doesn't turn on");

    expect(result.categoryKey).toBe('electronics-small-appliance');
    expect(result.safetyFlag).toBe(true);
    expect(result.options.length).toBe(6);

    // Verify ranking order: Repair is ranked first
    const [first, second, third, fourth, fifth, sixth] = result.options;
    expect(first.action).toBe('repair');
    expect(first.fit).toBe('best_fit');
    expect(first.fitLabel).toBe('Best fit');
    expect(first.reason).toContain('Usually a bulb, plug or switch');

    // Recycle, Repurpose, Replace must all be "Worth considering"
    const middleActions = [second, third, fourth].map(o => o.action);
    expect(middleActions).toContain('recycle');
    expect(middleActions).toContain('repurpose');
    expect(middleActions).toContain('replace');

    expect(second.fit).toBe('worth_considering');
    expect(third.fit).toBe('worth_considering');
    expect(fourth.fit).toBe('worth_considering');

    // Reuse and Discard must be "Unlikely"
    const bottomActions = [fifth, sixth].map(o => o.action);
    expect(bottomActions).toContain('reuse');
    expect(bottomActions).toContain('discard');
    expect(fifth.fit).toBe('unlikely');
    expect(sixth.fit).toBe('unlikely');

    // Verify Repair checklist has the 4 required steps
    const repairOption = result.options.find(o => o.action === 'repair')!;
    expect(repairOption.checklists.length).toBeGreaterThanOrEqual(4);
    expect(repairOption.checklists[0].text.toLowerCase()).toContain('unplug');
    expect(repairOption.checklists[1].text.toLowerCase()).toContain('bulb');
    expect(repairOption.checklists[2].text.toLowerCase()).toContain('plug and cord');
    expect(repairOption.checklists[3].text.toLowerCase()).toContain('socket');
  });

  it('handles unknown items with generic fallback and 2 quick questions', () => {
    // Completely unknown item name
    const unknownResult = scoreOptions('Vintage Mystery Gizmo', 'broken', 'Snapped part');
    expect(unknownResult.categoryKey).toBe('generic');
    expect(unknownResult.options.length).toBe(6);

    // Unknown item with quick questions answered (usesPower: true)
    const poweredUnknown = scoreOptions('Antique gadget', 'broken', "Doesn't spin", {
      usesPower: true,
      material: 'metal',
    });
    expect(poweredUnknown.categoryKey).toBe('electronics-small-appliance');
    expect(poweredUnknown.safetyFlag).toBe(true);

    // Unknown item with fabric material
    const fabricUnknown = scoreOptions('Old tapestry', 'worn_out', 'Frayed edge', {
      usesPower: false,
      material: 'fabric',
    });
    expect(fabricUnknown.categoryKey).toBe('clothing-textile');
  });

  it('ensures Replace is practical without shaming and Discard has responsible disposal', () => {
    const result = scoreOptions('Office chair', 'worn_out', 'Hydraulic cylinder sinks');
    const replaceOpt = result.options.find(o => o.action === 'replace')!;
    const discardOpt = result.options.find(o => o.action === 'discard')!;

    expect(replaceOpt.title).toBe('Replace');
    expect(replaceOpt.reason).toBeDefined();
    // Non-shaming validation
    expect(replaceOpt.reason.toLowerCase()).not.toContain('bad');
    expect(replaceOpt.reason.toLowerCase()).not.toContain('guilt');

    expect(discardOpt.title).toBe('Discard');
    // Responsible disposal check
    expect(discardOpt.optimalCriteria.length).toBeGreaterThan(5);
  });

  it('verifies cost considerations are formatted in Rupees and not dollars', () => {
    const result = scoreOptions('Desk lamp', 'broken', "Doesn't turn on");
    for (const option of result.options) {
      expect(option.considerations.cost.value).not.toContain('$');
      expect(option.considerations.cost.value).toMatch(/₹|Free/);
      // Ensure reasons and checklists do not reference $
      for (const reason of option.reasons) {
        expect(reason).not.toContain('$');
      }
      for (const item of option.checklists) {
        expect(item.text).not.toContain('$');
        if (item.detail) {
          expect(item.detail).not.toContain('$');
        }
      }
    }
  });
});
